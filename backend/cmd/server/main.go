package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/stacklevest/backend/internal/auth"
	"github.com/stacklevest/backend/internal/config"
	"github.com/stacklevest/backend/internal/middleware"
	"github.com/stacklevest/backend/internal/storage"
	"github.com/stacklevest/backend/internal/user"
)

func main() {
	// 1. Load Config
	cfg := config.Load()

	// 2. Initialize Storage (files)
	store := storage.NewJSONStore(cfg.DBPath)

	// 3. Initialize Services
	authService := auth.NewAuthService(store, cfg)
	userService := user.NewUserService(store)

	// 4. Initialize Handlers
	authHandler := auth.NewAuthHandler(authService)
	userHandler := user.NewUserHandler(userService)

	// 5. Setup Fiber
	app := fiber.New(fiber.Config{
		AppName: "StackleVest Backend",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(helmet.New())
	app.Use(limiter.New(limiter.Config{
		Max: 100, // Limit to 100 requests per minute
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000,http://192.168.0.114:3000", // Allow network IP
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Auth Middleware
	authMiddleware := middleware.AuthMiddleware(cfg)

	// Health Check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "healthy",
			"service": "backend-go",
		})
	})

	// 6. Routes
	authHandler.RegisterRoutes(app)
	userHandler.RegisterRoutes(app, authMiddleware)

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
