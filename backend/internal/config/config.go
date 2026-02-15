package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port      string
	JWTSecret string
	DBPath    string
}

func Load() *Config {
	// Attempt to load .env, ignore error if not found (production env vars)
	_ = godotenv.Load()

	return &Config{
		Port:      getEnv("PORT", "8080"),
		JWTSecret: getEnv("JWT_SECRET", "stacklevest-secret-2025"), // Default for dev
		DBPath:    getEnv("DB_PATH", "../websocket-server/db.json"),  // Path to existing db.json
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
