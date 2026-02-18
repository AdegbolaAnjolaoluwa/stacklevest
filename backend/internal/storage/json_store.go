package storage

import (
	"encoding/json"
	"errors"
	"log"
	"os"
	"strings"
	"sync"

	"github.com/stacklevest/backend/internal/domain"
)

type DB struct {
	Users    []domain.User        `json:"users"`
	Sessions []domain.UserSession `json:"sessions"`
	Channels []interface{}        `json:"channels"` // Placeholder to preserve data
	Messages []interface{}        `json:"messages"` // Placeholder
	Tasks    []interface{}        `json:"tasks"`    // Placeholder
}

type JSONStore struct {
	filepath string
	mu       sync.RWMutex
	cache    *DB // In-memory cache
}

func NewJSONStore(filepath string) *JSONStore {
	store := &JSONStore{
		filepath: filepath,
	}
	// Warm up cache on startup
	if _, err := store.load(); err != nil {
		log.Printf("Warning: Failed to load initial data: %v", err)
	}
	return store
}

// load returns the in-memory cache, populating it from disk if empty
func (s *JSONStore) load() (*DB, error) {
	// 1. Fast path: check cache with Read Lock
	s.mu.RLock()
	if s.cache != nil {
		defer s.mu.RUnlock()
		return s.cache, nil
	}
	s.mu.RUnlock()

	// 2. Slow path: load from disk with Write Lock
	s.mu.Lock()
	defer s.mu.Unlock()

	// Double check cache in case someone else loaded it while we waited for lock
	if s.cache != nil {
		return s.cache, nil
	}

	data, err := os.ReadFile(s.filepath)
	if err != nil {
		if os.IsNotExist(err) {
			s.cache = &DB{Users: []domain.User{}}
			return s.cache, nil
		}
		return nil, err
	}

	var db DB
	if len(data) == 0 {
		s.cache = &DB{Users: []domain.User{}}
		return s.cache, nil
	}

	if err := json.Unmarshal(data, &db); err != nil {
		return nil, err
	}

	s.cache = &db
	return s.cache, nil
}

// save writes the current cache to disk
// Caller must hold s.mu.Lock()
func (s *JSONStore) save() error {
	if s.cache == nil {
		return errors.New("cache is nil")
	}

	data, err := json.MarshalIndent(s.cache, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.filepath, data, 0644)
}

// Implement UserRepository

func (s *JSONStore) FindAll() ([]domain.User, error) {
	db, err := s.load()
	if err != nil {
		return nil, err
	}
	// Return a copy to prevent external modification of cache? 
	// For performance, we return direct slice, but be careful not to modify elements.
	// In this app, we only modify via Update(), so it's fine.
	return db.Users, nil
}

func (s *JSONStore) FindByID(id string) (*domain.User, error) {
	db, err := s.load()
	if err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	for _, u := range db.Users {
		if u.ID == id {
			// Return copy to avoid race conditions if caller modifies *User
			user := u
			return &user, nil
		}
	}
	return nil, nil // Not found
}

func (s *JSONStore) FindByEmail(email string) (*domain.User, error) {
	db, err := s.load()
	if err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, u := range db.Users {
		if strings.EqualFold(u.Email, email) {
			user := u
			return &user, nil
		}
	}
	return nil, nil
}

func (s *JSONStore) Create(user *domain.User) error {
	// Ensure cache is loaded
	if _, err := s.load(); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	s.cache.Users = append(s.cache.Users, *user)
	return s.save()
}

func (s *JSONStore) Update(user *domain.User) error {
	if _, err := s.load(); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for i, u := range s.cache.Users {
		if u.ID == user.ID {
			s.cache.Users[i] = *user
			return s.save()
		}
	}
	return errors.New("user not found")
}

func (s *JSONStore) Delete(id string) error {
	if _, err := s.load(); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for i, u := range s.cache.Users {
		if u.ID == id {
			s.cache.Users = append(s.cache.Users[:i], s.cache.Users[i+1:]...)
			return s.save()
		}
	}
	return errors.New("user not found")
}

// Session Management Implementation

func (s *JSONStore) CreateSession(session *domain.UserSession) error {
	if _, err := s.load(); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	s.cache.Sessions = append(s.cache.Sessions, *session)
	return s.save()
}

func (s *JSONStore) FindSessionByToken(token string) (*domain.UserSession, error) {
	db, err := s.load()
	if err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, sess := range db.Sessions {
		if sess.RefreshToken == token {
			session := sess
			return &session, nil
		}
	}
	return nil, nil
}

func (s *JSONStore) DeleteSession(id string) error {
	if _, err := s.load(); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for i, sess := range s.cache.Sessions {
		if sess.ID == id {
			s.cache.Sessions = append(s.cache.Sessions[:i], s.cache.Sessions[i+1:]...)
			return s.save()
		}
	}
	return nil // Already deleted or not found
}

func (s *JSONStore) DeleteUserSessions(userID string) error {
	if _, err := s.load(); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var remainingSessions []domain.UserSession
	for _, sess := range s.cache.Sessions {
		if sess.UserID != userID {
			remainingSessions = append(remainingSessions, sess)
		}
	}
	s.cache.Sessions = remainingSessions
	return s.save()
}

func (s *JSONStore) FindAllSessions() ([]domain.UserSession, error) {
	db, err := s.load()
	if err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Return a copy
	sessions := make([]domain.UserSession, len(db.Sessions))
	copy(sessions, db.Sessions)
	return sessions, nil
}
