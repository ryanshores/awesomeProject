package handlers

import (
	"awesomeProject/config"
	"awesomeProject/internal/middleware"
	"awesomeProject/internal/models"
	"awesomeProject/internal/services"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v81"
	"gorm.io/gorm"
)

type CheckoutHandler struct {
	db        *gorm.DB
	cfg       *config.Config
	stripeSvc *services.StripeService
}

func NewCheckoutHandler(db *gorm.DB, cfg *config.Config) *CheckoutHandler {
	return &CheckoutHandler{
		db:        db,
		cfg:       cfg,
		stripeSvc: services.NewStripeService(cfg),
	}
}

type CreateCheckoutSessionRequest struct {
	SuccessURL string `json:"success_url" binding:"required"`
	CancelURL  string `json:"cancel_url" binding:"required"`
}

func (h *CheckoutHandler) CreateCheckoutSession(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var req CreateCheckoutSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var cartItems []models.CartItem
	if err := h.db.Where("user_id = ?", userID).Preload("Product").Find(&cartItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}

	if len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	var lineItems []*stripe.CheckoutSessionLineItemParams
	for _, item := range cartItems {
		lineItems = append(lineItems, services.ConvertProductToLineItem(&item.Product, int64(item.Quantity)))
	}

	var user models.User
	h.db.First(&user, userID)

	session, err := h.stripeSvc.CreateCheckoutSession(userID, lineItems, "", req.SuccessURL, req.CancelURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create checkout session: %v", err)})
		return
	}

	c.JSON(http.StatusOK, models.CheckoutSession{
		SessionID: session.ID,
		URL:       session.URL,
	})
}

type CreateSubscriptionRequest struct {
	PlanID     uint   `json:"plan_id" binding:"required"`
	SuccessURL string `json:"success_url" binding:"required"`
	CancelURL  string `json:"cancel_url" binding:"required"`
}

func (h *CheckoutHandler) CreateSubscriptionSession(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var req CreateSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var plan models.SubscriptionPlan
	if err := h.db.First(&plan, req.PlanID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
		return
	}

	if plan.StripePriceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Plan not synced with Stripe"})
		return
	}

	session, err := h.stripeSvc.CreateSubscriptionSession(userID, plan.StripePriceID, "", req.SuccessURL, req.CancelURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create subscription session: %v", err)})
		return
	}

	c.JSON(http.StatusOK, models.CheckoutSession{
		SessionID: session.ID,
		URL:       session.URL,
	})
}

func (h *CheckoutHandler) HandleWebhook(c *gin.Context) {
	payload, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read payload"})
		return
	}

	sig := c.GetHeader("Stripe-Signature")
	event, err := h.stripeSvc.ConstructEvent(payload, sig)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook signature"})
		return
	}

	switch event.Type {
	case "checkout.session.completed":
		h.handleCheckoutSessionCompleted(event.Data.Object)
	case "customer.subscription.created", "customer.subscription.updated":
		h.handleSubscriptionUpdated(event.Data.Object)
	case "customer.subscription.deleted":
		h.handleSubscriptionDeleted(event.Data.Object)
	}

	c.JSON(http.StatusOK, gin.H{"received": true})
}

func (h *CheckoutHandler) handleCheckoutSessionCompleted(data map[string]interface{}) {
	sessionID, ok := data["id"].(string)
	if !ok {
		return
	}

	session, err := h.stripeSvc.GetCheckoutSession(sessionID)
	if err != nil {
		return
	}

	var total int64
	for _, item := range session.LineItems.Data {
		total += item.AmountTotal
	}

	userID := session.Metadata["user_id"]
	if userID == "" {
		return
	}

	var user models.User
	h.db.Where("id = ?", userID).First(&user)

	order := models.Order{
		UserID:                user.ID,
		Status:                "completed",
		Total:                 total,
		StripePaymentIntentID: session.PaymentIntent.ID,
	}

	h.db.Create(&order)

	var cartItems []models.CartItem
	h.db.Where("user_id = ?", user.ID).Preload("Product").Find(&cartItems)

	for _, item := range cartItems {
		orderItem := models.OrderItem{
			OrderID:   order.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Product.Price,
		}
		h.db.Create(&orderItem)
	}

	h.db.Where("user_id = ?", user.ID).Delete(&models.CartItem{})
	h.db.Model(&models.Product{}).Where("id IN ?", getCartItemProductIDs(cartItems)).UpdateColumn("stock", gorm.Expr("stock - ?", 1))
}

func getCartItemProductIDs(items []models.CartItem) []uint {
	ids := make([]uint, len(items))
	for i, item := range items {
		ids[i] = item.ProductID
	}
	return ids
}

func (h *CheckoutHandler) handleSubscriptionUpdated(data map[string]interface{}) {
	subID, ok := data["id"].(string)
	if !ok {
		return
	}

	stripeSub, err := h.stripeSvc.GetSubscription(subID)
	if err != nil {
		return
	}

	var sub models.Subscription
	if err := h.db.Where("stripe_subscription_id = ?", subID).First(&sub).Error; err != nil {
		sub = models.Subscription{
			StripeSubscriptionID: subID,
			Status:               models.MapStripeSubscriptionStatus(stripeSub.Status),
		}
		h.db.Create(&sub)
	} else {
		sub.Status = models.MapStripeSubscriptionStatus(stripeSub.Status)
		h.db.Save(&sub)
	}
}

func (h *CheckoutHandler) handleSubscriptionDeleted(data map[string]interface{}) {
	subID, ok := data["id"].(string)
	if !ok {
		return
	}

	h.db.Model(&models.Subscription{}).Where("stripe_subscription_id = ?", subID).Update("status", "canceled")
}
