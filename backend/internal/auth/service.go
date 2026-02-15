package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"github.com/stacklevest/backend/internal/config"
	"github.com/stacklevest/backend/internal/domain"
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
	User        *domain.User `json:"user,omitempty"`
	Token       string       `json:"token,omitempty"`
	RequiresOTP bool         `json:"requiresOtp,omitempty"`
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

	// 5. Generate Token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		User:  user,
		Token: token,
	}, nil
}

func (s *AuthService) generateToken(user *domain.User) (string, error) {
	claims := jwt.MapClaims{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWTSecret))
}
