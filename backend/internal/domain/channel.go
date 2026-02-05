package domain

import "time"

type Channel struct {
	ID          string    `json:"id"`
	WorkspaceID string    `json:"workspace_id"`
	Name        string    `json:"name"`
	Type        string    `json:"type"` // public, private
	CreatedAt   time.Time `json:"created_at"`
}
