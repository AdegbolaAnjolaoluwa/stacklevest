package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"github.com/stacklevest/backend/internal/config"
	"github.com/stacklevest/backend/internal/domain"
	"github.com/stacklevest/backend/internal/storage"
)

type AuthService struct {
	repo   domain.UserRepository
	config *config.Config
}

func NewAuthService(repo domain.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		repo:   repo,
		config: cfg,
	}
}

type LoginResponse struct {
	User         *domain.User `json:"user,omitempty"`
	AccessToken  string       `json:"accessToken,omitempty"`
	RefreshToken string       `json:"refreshToken,omitempty"` // For the first login response if needed
	RequiresOTP  bool         `json:"requiresOtp,omitempty"`
}

func (s *AuthService) Login(email, password string) (*LoginResponse, error) {
	// 1. Find User
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("invalid credentials")
	}

	// 2. Check Password
	// Check if stored password is a bcrypt hash (starts with $2a$)
	isHashed := len(user.Password) >= 4 && user.Password[:4] == "$2a$"

	if isHashed {
		// Verify Hash
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
			return nil, errors.New("invalid credentials")
		}
	} else {
		// Legacy Plaintext Check
		if user.Password != password {
			return nil, errors.New("invalid credentials")
		}
		
		// 3. Auto-Upgrade to Bcrypt
		hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err == nil {
			user.Password = string(hashedBytes)
			if err := s.repo.Update(user); err != nil {
				// Log error but continue login
				// In production, use a proper logger
			}
		}
	}

	// 4. Check Onboarding
	if user.NeedsOnboarding {
		return &LoginResponse{
			RequiresOTP: true,
		}, nil
	}

	// 5. Generate Tokens
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.createSession(user.ID)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) Refresh(refreshToken string) (*LoginResponse, error) {
	// Find session (In a real DB this would be indexed, here we iterate)
	// For rotation, we might need the actual token to find it, but it's hashed.
	// So we find by UserID? No, we don't have it.
	// We'll have to iterate all sessions and bcrypt compare.
	
	sessions, err := s.repo.(*storage.JSONStore).FindAllSessions() // I may need to add this to repo interface or cast
	if err != nil {
		return nil, err
	}

	var foundSession *domain.UserSession
	for _, sess := range sessions {
		if err := bcrypt.CompareHashAndPassword([]byte(sess.RefreshToken), []byte(refreshToken)); err == nil {
			foundSession = &sess
			break
		}
	}

	if foundSession == nil || foundSession.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("invalid or expired refresh token")
	}

	// Token is valid. ROTATE.
	user, err := s.repo.FindByID(foundSession.UserID)
	if err != nil || user == nil {
		return nil, errors.New("user not found")
	}

	// Delete old session
	s.repo.DeleteSession(foundSession.ID)

	// Create new session
	newAccessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	newRefreshToken, err := s.createSession(user.ID)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		User:         user,
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (s *AuthService) Logout(refreshToken string) error {
	// Find and delete session
	sessions, _ := s.repo.(*storage.JSONStore).FindAllSessions()
	for _, sess := range sessions {
		if err := bcrypt.CompareHashAndPassword([]byte(sess.RefreshToken), []byte(refreshToken)); err == nil {
			return s.repo.DeleteSession(sess.ID)
		}
	}
	return nil
}

func (s *AuthService) createSession(userID string) (string, error) {
	// Actually, just using a UUID or a long random string is fine.
	refreshToken := domain.GenerateRandomString(32) 
	
	hashedToken, err := bcrypt.GenerateFromPassword([]byte(refreshToken), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	session := &domain.UserSession{
		ID:           domain.GenerateID("sess"),
		UserID:       userID,
		RefreshToken: string(hashedToken),
		ExpiresAt:    time.Now().Add(time.Hour * 24 * 7), // 7 days
		CreatedAt:    time.Now(),
	}

	if err := s.repo.CreateSession(session); err != nil {
		return "", err
	}

	return refreshToken, nil
}

func (s *AuthService) generateAccessToken(user *domain.User) (string, error) {
	claims := jwt.MapClaims{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(time.Minute * 5).Unix(), // 5 minutes as requested
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWTSecret))
}
