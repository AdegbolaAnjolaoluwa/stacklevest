package domain

import "time"

type Task struct {
	ID          string    `json:"id"`
	WorkspaceID string    `json:"workspace_id"`
	AssigneeID  string    `json:"assignee_id"`
	Title       string    `json:"title"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}
