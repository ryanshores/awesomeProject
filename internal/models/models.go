package models

import (
	"time"

	"github.com/stripe/stripe-go/v81"
	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	FirstName string         `json:"first_name"`
	LastName  string         `json:"last_name"`
	IsAdmin   bool           `json:"is_admin" gorm:"default:false"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`

	Orders        []Order        `json:"orders,omitempty"`
	Subscriptions []Subscription `json:"subscriptions,omitempty"`
	CartItems     []CartItem     `json:"cart_items,omitempty"`
}

type Product struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	Price       int64          `json:"price" gorm:"not null"`
	ImageURL    string         `json:"image_url"`
	Stock       int            `json:"stock" gorm:"default:0"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	Category    string         `json:"category"`
	SKU         string         `json:"sku" gorm:"uniqueIndex"`

	StripeProductID string `json:"-"`
	StripePriceID   string `json:"-"`
}

type SubscriptionPlan struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
	Name            string         `json:"name" gorm:"not null"`
	Description     string         `json:"description"`
	Price           int64          `json:"price" gorm:"not null"`
	Interval        string         `json:"interval" gorm:"not null"`
	IntervalCount   int64          `json:"interval_count" gorm:"default:1"`
	Features        string         `json:"features"`
	IsActive        bool           `json:"is_active" gorm:"default:true"`
	TrialPeriodDays int64          `json:"trial_period_days"`

	StripeProductID string `json:"-"`
	StripePriceID   string `json:"-"`
}

type Subscription struct {
	ID                 uint           `json:"id" gorm:"primaryKey"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `json:"-" gorm:"index"`
	UserID             uint           `json:"user_id" gorm:"not null;index"`
	PlanID             uint           `json:"plan_id" gorm:"not null"`
	Status             string         `json:"status" gorm:"not null"`
	CurrentPeriodStart time.Time      `json:"current_period_start"`
	CurrentPeriodEnd   time.Time      `json:"current_period_end"`
	CancelAtPeriodEnd  bool           `json:"cancel_at_period_end" gorm:"default:false"`

	User User             `json:"user,omitempty"`
	Plan SubscriptionPlan `json:"plan,omitempty"`

	StripeSubscriptionID string `json:"-"`
}

type Order struct {
	ID                    uint           `json:"id" gorm:"primaryKey"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `json:"-" gorm:"index"`
	UserID                uint           `json:"user_id" gorm:"not null;index"`
	Status                string         `json:"status" gorm:"not null"`
	Total                 int64          `json:"total" gorm:"not null"`
	StripePaymentIntentID string         `json:"-"`

	User       User        `json:"user,omitempty"`
	OrderItems []OrderItem `json:"order_items,omitempty"`
}

type OrderItem struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"created_at"`
	OrderID   uint      `json:"order_id" gorm:"not null;index"`
	ProductID uint      `json:"product_id" gorm:"not null"`
	Quantity  int       `json:"quantity" gorm:"not null"`
	Price     int64     `json:"price" gorm:"not null"`

	Product Product `json:"product,omitempty"`
}

type CartItem struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	ProductID uint      `json:"product_id" gorm:"not null"`
	Quantity  int       `json:"quantity" gorm:"not null"`

	Product Product `json:"product,omitempty"`
}

type CheckoutSession struct {
	SessionID string `json:"session_id"`
	URL       string `json:"url"`
}

type WebhookEvent struct {
	Type string `json:"type"`
	Data struct {
		Object map[string]interface{} `json:"object"`
	} `json:"data"`
}

func (User) TableName() string {
	return "users"
}

func (Product) TableName() string {
	return "products"
}

func (SubscriptionPlan) TableName() string {
	return "subscription_plans"
}

func (Subscription) TableName() string {
	return "subscriptions"
}

func (Order) TableName() string {
	return "orders"
}

func (OrderItem) TableName() string {
	return "order_items"
}

func (CartItem) TableName() string {
	return "cart_items"
}

func MapStripeSubscriptionStatus(status stripe.SubscriptionStatus) string {
	switch status {
	case stripe.SubscriptionStatusActive:
		return "active"
	case stripe.SubscriptionStatusPastDue:
		return "past_due"
	case stripe.SubscriptionStatusCanceled:
		return "canceled"
	case stripe.SubscriptionStatusUnpaid:
		return "unpaid"
	case stripe.SubscriptionStatusTrialing:
		return "trialing"
	case stripe.SubscriptionStatusPaused:
		return "paused"
	case stripe.SubscriptionStatusIncomplete:
		return "incomplete"
	case stripe.SubscriptionStatusIncompleteExpired:
		return "incomplete_expired"
	default:
		return "unknown"
	}
}
