package handlers

import (
	"awesomeProject/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SubscriptionHandler struct {
	db *gorm.DB
}

func NewSubscriptionHandler(db *gorm.DB) *SubscriptionHandler {
	return &SubscriptionHandler{db: db}
}

func (h *SubscriptionHandler) ListPlans(c *gin.Context) {
	var plans []models.SubscriptionPlan
	if err := h.db.Where("is_active = ?", true).Find(&plans).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plans"})
		return
	}
	c.JSON(http.StatusOK, plans)
}

func (h *SubscriptionHandler) GetPlan(c *gin.Context) {
	id := c.Param("id")
	var plan models.SubscriptionPlan
	if err := h.db.First(&plan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
		return
	}
	c.JSON(http.StatusOK, plan)
}

type CreatePlanRequest struct {
	Name            string `json:"name" binding:"required"`
	Description     string `json:"description"`
	Price           int64  `json:"price" binding:"required,gt=0"`
	Interval        string `json:"interval" binding:"required,oneof=day week month year"`
	IntervalCount   int64  `json:"interval_count"`
	Features        string `json:"features"`
	TrialPeriodDays int64  `json:"trial_period_days"`
}

func (h *SubscriptionHandler) CreatePlan(c *gin.Context) {
	var req CreatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plan := models.SubscriptionPlan{
		Name:            req.Name,
		Description:     req.Description,
		Price:           req.Price,
		Interval:        req.Interval,
		IntervalCount:   req.IntervalCount,
		Features:        req.Features,
		TrialPeriodDays: req.TrialPeriodDays,
		IsActive:        true,
	}

	if err := h.db.Create(&plan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create plan"})
		return
	}

	c.JSON(http.StatusCreated, plan)
}

func (h *SubscriptionHandler) UpdatePlan(c *gin.Context) {
	id := c.Param("id")
	var plan models.SubscriptionPlan
	if err := h.db.First(&plan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
		return
	}

	var req CreatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plan.Name = req.Name
	plan.Description = req.Description
	plan.Price = req.Price
	plan.Interval = req.Interval
	plan.IntervalCount = req.IntervalCount
	plan.Features = req.Features
	plan.TrialPeriodDays = req.TrialPeriodDays

	if err := h.db.Save(&plan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update plan"})
		return
	}

	c.JSON(http.StatusOK, plan)
}

func (h *SubscriptionHandler) DeletePlan(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&models.SubscriptionPlan{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete plan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Plan deleted"})
}

func (h *SubscriptionHandler) GetUserSubscriptions(c *gin.Context) {
	userID := c.GetUint("user_id")
	var subscriptions []models.Subscription
	if err := h.db.Where("user_id = ?", userID).Preload("Plan").Find(&subscriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}
	c.JSON(http.StatusOK, subscriptions)
}
