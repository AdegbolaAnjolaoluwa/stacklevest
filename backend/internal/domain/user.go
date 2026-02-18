package domain

import "time"

const (
	RoleAdmin   = "admin"
	RoleManager = "manager"
	RoleStaff   = "staff"
)

type User struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Email            string    `json:"email"`
	Password         string    `json:"password"` // Managed manually for API security
	NeedsOnboarding  bool      `json:"needsOnboarding"`
	Role             string    `json:"role"`
	Department       string    `json:"department"`
	JobTitle         string    `json:"jobTitle"`
	ReportingManager string    `json:"reportingManager"`
	StaffNumber      string    `json:"staffNumber"`
	Status           string    `json:"status"`
	Avatar           string    `json:"avatar"`
	CreatedAt        time.Time `json:"createdAt"`
}

func (u *User) Sanitize() {
	u.Password = ""
}

type UserSession struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	RefreshToken string    `json:"refreshToken"` // Hashed
	ExpiresAt    time.Time `json:"expiresAt"`
	CreatedAt    time.Time `json:"createdAt"`
}

type UserRepository interface {
	FindAll() ([]User, error)
	FindByID(id string) (*User, error)
	FindByEmail(email string) (*User, error)
	Create(user *User) error
	Update(user *User) error
	Delete(id string) error

	// Session Management
	CreateSession(session *UserSession) error
	FindSessionByToken(token string) (*UserSession, error)
	DeleteSession(id string) error
	DeleteUserSessions(userID string) error
	FindAllSessions() ([]UserSession, error)
}

// Helpers
func GenerateID(prefix string) string {
	return prefix + "_" + time.Now().Format("20060102150405") + "_" + GenerateRandomString(6)
}

func GenerateRandomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}
