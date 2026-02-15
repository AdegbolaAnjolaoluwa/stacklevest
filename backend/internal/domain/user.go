package domain

import "time"

type User struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Email            string    `json:"email"`
	Password         string    `json:"password"` // In production, this should be hashed. For now, matching db.json plain text (will migrate involved)
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

type UserRepository interface {
	FindAll() ([]User, error)
	FindByID(id string) (*User, error)
	FindByEmail(email string) (*User, error)
	Create(user *User) error
	Update(user *User) error
	Delete(id string) error
}
