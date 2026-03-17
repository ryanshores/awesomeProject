package handlers

import (
	"awesomeProject/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct {
	db *gorm.DB
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

func (h *AdminHandler) Dashboard(c *gin.Context) {
	var productCount int64
	var userCount int64
	var orderCount int64
	var subscriptionCount int64

	h.db.Model(&models.Product{}).Count(&productCount)
	h.db.Model(&models.User{}).Count(&userCount)
	h.db.Model(&models.Order{}).Count(&orderCount)
	h.db.Model(&models.Subscription{}).Count(&subscriptionCount)

	c.JSON(http.StatusOK, gin.H{
		"products":      productCount,
		"users":         userCount,
		"orders":        orderCount,
		"subscriptions": subscriptionCount,
	})
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	var users []models.User
	var total int64

	h.db.Model(&models.User{}).Count(&total)
	h.db.Limit(limit).Offset(offset).Find(&users)

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *AdminHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := h.db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

type UpdateUserRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	IsAdmin   *bool  `json:"is_admin"`
	IsActive  *bool  `json:"is_active"`
}

func (h *AdminHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := h.db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.IsAdmin != nil {
		user.IsAdmin = *req.IsAdmin
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *AdminHandler) ListOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	var orders []models.Order
	var total int64

	h.db.Model(&models.Order{}).Count(&total)
	h.db.Preload("User").Preload("OrderItems.Product").Limit(limit).Offset(offset).Find(&orders)

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
		"total":  total,
		"page":   page,
		"limit":  limit,
	})
}

func (h *AdminHandler) GetOrder(c *gin.Context) {
	id := c.Param("id")
	var order models.Order
	if err := h.db.Preload("User").Preload("OrderItems.Product").First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}
	c.JSON(http.StatusOK, order)
}

func (h *AdminHandler) ListSubscriptions(c *gin.Context) {
	var subscriptions []models.Subscription
	h.db.Preload("User").Preload("Plan").Find(&subscriptions)
	c.JSON(http.StatusOK, subscriptions)
}
