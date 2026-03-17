package main

import (
	"awesomeProject/config"
	"awesomeProject/internal/handlers"
	"awesomeProject/internal/middleware"
	"awesomeProject/internal/models"
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()

	db, err := initDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	router := setupRouter(cfg, db)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server starting on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func initDB(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.SubscriptionPlan{},
		&models.Subscription{},
		&models.Order{},
		&models.OrderItem{},
		&models.CartItem{},
	); err != nil {
		return nil, err
	}

	return db, nil
}

func setupRouter(cfg *config.Config, db *gorm.DB) *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	authHandler := handlers.NewAuthHandler(db, cfg)
	productHandler := handlers.NewProductHandler(db, cfg)
	subscriptionHandler := handlers.NewSubscriptionHandler(db)
	cartHandler := handlers.NewCartHandler(db)
	checkoutHandler := handlers.NewCheckoutHandler(db, cfg)
	adminHandler := handlers.NewAdminHandler(db)

	api := router.Group("/api")
	{
		api.POST("/auth/register", authHandler.Register)
		api.POST("/auth/login", authHandler.Login)

		api.GET("/products", productHandler.List)
		api.GET("/products/:id", productHandler.Get)

		api.GET("/subscriptions/plans", subscriptionHandler.ListPlans)
		api.GET("/subscriptions/plans/:id", subscriptionHandler.GetPlan)

		api.POST("/webhook", checkoutHandler.HandleWebhook)

		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			protected.GET("/auth/me", authHandler.Me)

			protected.GET("/cart", cartHandler.GetCart)
			protected.POST("/cart", cartHandler.AddItem)
			protected.PUT("/cart/:id", cartHandler.UpdateItem)
			protected.DELETE("/cart/:id", cartHandler.RemoveItem)
			protected.DELETE("/cart", cartHandler.ClearCart)

			protected.POST("/checkout/session", checkoutHandler.CreateCheckoutSession)
			protected.POST("/checkout/subscription", checkoutHandler.CreateSubscriptionSession)

			protected.GET("/subscriptions", subscriptionHandler.GetUserSubscriptions)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg))
		admin.Use(middleware.AdminMiddleware())
		{
			admin.GET("/dashboard", adminHandler.Dashboard)

			admin.GET("/users", adminHandler.ListUsers)
			admin.GET("/users/:id", adminHandler.GetUser)
			admin.PUT("/users/:id", adminHandler.UpdateUser)

			admin.GET("/orders", adminHandler.ListOrders)
			admin.GET("/orders/:id", adminHandler.GetOrder)

			admin.GET("/subscriptions", adminHandler.ListSubscriptions)

			admin.POST("/products", productHandler.Create)
			admin.PUT("/products/:id", productHandler.Update)
			admin.DELETE("/products/:id", productHandler.Delete)

			admin.POST("/subscriptions/plans", subscriptionHandler.CreatePlan)
			admin.PUT("/subscriptions/plans/:id", subscriptionHandler.UpdatePlan)
			admin.DELETE("/subscriptions/plans/:id", subscriptionHandler.DeletePlan)
		}
	}

	return router
}
