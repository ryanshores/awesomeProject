package handlers

import (
	"awesomeProject/internal/middleware"
	"awesomeProject/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CartHandler struct {
	db *gorm.DB
}

func NewCartHandler(db *gorm.DB) *CartHandler {
	return &CartHandler{db: db}
}

func (h *CartHandler) GetCart(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var cartItems []models.CartItem
	if err := h.db.Where("user_id = ?", userID).Preload("Product").Find(&cartItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}
	c.JSON(http.StatusOK, cartItems)
}

type AddToCartRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,gt=0"`
}

func (h *CartHandler) AddItem(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var product models.Product
	if err := h.db.First(&product, req.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	if product.Stock < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
		return
	}

	var existingItem models.CartItem
	err := h.db.Where("user_id = ? AND product_id = ?", userID, req.ProductID).First(&existingItem).Error
	if err == nil {
		existingItem.Quantity += req.Quantity
		if err := h.db.Save(&existingItem).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
			return
		}
		c.JSON(http.StatusOK, existingItem)
		return
	}

	cartItem := models.CartItem{
		UserID:    userID,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
	}

	if err := h.db.Create(&cartItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to cart"})
		return
	}

	h.db.Preload("Product").First(&cartItem, cartItem.ID)
	c.JSON(http.StatusCreated, cartItem)
}

func (h *CartHandler) UpdateItem(c *gin.Context) {
	userID := middleware.GetUserID(c)
	itemID := c.Param("id")

	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var cartItem models.CartItem
	if err := h.db.Where("id = ? AND user_id = ?", itemID, userID).First(&cartItem).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	var product models.Product
	if err := h.db.First(&product, cartItem.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	if product.Stock < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
		return
	}

	cartItem.Quantity = req.Quantity
	if err := h.db.Save(&cartItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
		return
	}

	h.db.Preload("Product").First(&cartItem, cartItem.ID)
	c.JSON(http.StatusOK, cartItem)
}

func (h *CartHandler) RemoveItem(c *gin.Context) {
	userID := middleware.GetUserID(c)
	itemID := c.Param("id")

	if err := h.db.Where("id = ? AND user_id = ?", itemID, userID).Delete(&models.CartItem{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item removed"})
}

func (h *CartHandler) ClearCart(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if err := h.db.Where("user_id = ?", userID).Delete(&models.CartItem{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared"})
}
