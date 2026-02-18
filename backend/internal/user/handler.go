package user

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/stacklevest/backend/internal/domain"
	"github.com/stacklevest/backend/internal/middleware"
)

type UserHandler struct {
	service *UserService
}

func NewUserHandler(service *UserService) *UserHandler {
	return &UserHandler{
		service: service,
	}
}

func (h *UserHandler) RegisterRoutes(app *fiber.App, authMiddleware fiber.Handler) {
	// Group users routes
	users := app.Group("/api/users")

	// Apply Auth Middleware to all routes
	users.Use(authMiddleware)

	// Admin Only Routes
	users.Get("/", middleware.AdminGuard, h.GetAll)
	users.Post("/", middleware.AdminGuard, h.Create)
	users.Put("/:id", middleware.AdminGuard, h.Update)
	users.Delete("/:id", middleware.AdminGuard, h.Delete)
	
	users.Get("/email/:email", h.GetByEmail)
	users.Get("/:id", h.GetByID)
}

func (h *UserHandler) Create(c *fiber.Ctx) error {
	var u domain.User
	if err := c.BodyParser(&u); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	if err := h.service.Create(&u); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	u.Sanitize()
	return c.Status(fiber.StatusCreated).JSON(u)
}

func (h *UserHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var u domain.User
	if err := c.BodyParser(&u); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	u.ID = id

	if err := h.service.Update(&u); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	u.Sanitize()
	return c.JSON(u)
}

func (h *UserHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.Delete(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *UserHandler) GetAll(c *fiber.Ctx) error {
	log.Println("Handling GET /api/users")
	users, err := h.service.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	// Return empty array instead of null if users is nil
	if users == nil {
		users = []domain.User{}
	}

	for i := range users {
		users[i].Sanitize()
	}

	return c.JSON(users)
}

func (h *UserHandler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	user, err := h.service.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}
	user.Sanitize()
	return c.JSON(user)
}

func (h *UserHandler) GetByEmail(c *fiber.Ctx) error {
	email := c.Params("email")
	user, err := h.service.GetByEmail(email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}
	return c.JSON(user)
}
