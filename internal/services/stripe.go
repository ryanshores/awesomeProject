package services

import (
	"awesomeProject/config"
	"awesomeProject/internal/models"
	"context"
	"errors"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
	"github.com/stripe/stripe-go/v81/customer"
	"github.com/stripe/stripe-go/v81/paymentintent"
	"github.com/stripe/stripe-go/v81/price"
	"github.com/stripe/stripe-go/v81/product"
	"github.com/stripe/stripe-go/v81/subscription"
	"github.com/stripe/stripe-go/v81/webhook"
)

type StripeService struct {
	cfg *config.Config
}

func NewStripeService(cfg *config.Config) *StripeService {
	stripe.Key = cfg.StripeSecretKey
	return &StripeService{cfg: cfg}
}

func (s *StripeService) CreateProduct(name, description string) (*stripe.Product, error) {
	params := &stripe.ProductParams{
		Name:        stripe.String(name),
		Description: stripe.String(description),
	}
	return product.New(params)
}

func (s *StripeService) CreatePrice(productID string, amount int64, interval string, intervalCount int64) (*stripe.Price, error) {
	params := &stripe.PriceParams{
		Product:    stripe.String(productID),
		UnitAmount: stripe.Int64(amount),
		Currency:   stripe.String(string(stripe.CurrencyUSD)),
	}

	if interval != "" {
		params.Recurring = &stripe.PriceRecurringParams{
			Interval:      stripe.String(interval),
			IntervalCount: stripe.Int64(intervalCount),
		}
	}

	return price.New(params)
}

func (s *StripeService) CreateCustomer(email, name string) (*stripe.Customer, error) {
	params := &stripe.CustomerParams{
		Email: stripe.String(email),
		Name:  stripe.String(name),
	}
	return customer.New(params)
}

func (s *StripeService) CreateCheckoutSession(userID uint, lineItems []*stripe.CheckoutSessionLineItemParams, customerID string, successURL, cancelURL string) (*stripe.CheckoutSession, error) {
	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems:          lineItems,
		Mode:               stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL:         stripe.String(successURL),
		CancelURL:          stripe.String(cancelURL),
		Metadata: map[string]string{
			"user_id": string(rune(userID)),
		},
	}

	if customerID != "" {
		params.Customer = stripe.String(customerID)
	}

	return session.New(params)
}

func (s *StripeService) CreateSubscriptionSession(userID uint, priceID, customerID, successURL, cancelURL string) (*stripe.CheckoutSession, error) {
	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		Mode:               stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(successURL),
		CancelURL:  stripe.String(cancelURL),
		Metadata: map[string]string{
			"user_id": string(rune(userID)),
		},
	}

	if customerID != "" {
		params.Customer = stripe.String(customerID)
	}

	return session.New(params)
}

func (s *StripeService) GetSubscription(subID string) (*stripe.Subscription, error) {
	return subscription.Get(subID, nil)
}

func (s *StripeService) CancelSubscription(subID string) (*stripe.Subscription, error) {
	params := &stripe.SubscriptionCancelParams{}
	return subscription.Cancel(subID, params)
}

func (s *StripeService) UpdateSubscription(subID string, params *stripe.SubscriptionParams) (*stripe.Subscription, error) {
	return subscription.Update(subID, params)
}

func (s *StripeService) GetCheckoutSession(sessionID string) (*stripe.CheckoutSession, error) {
	return session.Get(sessionID, nil)
}

func ConvertProductToLineItem(p *models.Product, quantity int64) *stripe.CheckoutSessionLineItemParams {
	if p.StripePriceID != "" {
		return &stripe.CheckoutSessionLineItemParams{
			Price:    stripe.String(p.StripePriceID),
			Quantity: stripe.Int64(quantity),
		}
	}
	return &stripe.CheckoutSessionLineItemParams{
		PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
			Currency:   stripe.String(string(stripe.CurrencyUSD)),
			UnitAmount: stripe.Int64(p.Price),
			ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
				Name:        stripe.String(p.Name),
				Description: stripe.String(p.Description),
			},
		},
		Quantity: stripe.Int64(quantity),
	}
}

func VerifyWebhookSignature(payload []byte, sig string, secret string) (stripe.Event, error) {
	if secret == "" {
		return stripe.Event{}, errors.New("webhook secret not configured")
	}
	return webhook.ConstructEvent(payload, sig, secret)
}

func (s *StripeService) ConstructEvent(payload []byte, sig string) (stripe.Event, error) {
	return VerifyWebhookSignature(payload, sig, s.cfg.StripeWebhookSecret)
}

type StripeProductService struct {
	svc *StripeService
}

func NewStripeProductService(cfg *config.Config) *StripeProductService {
	return &StripeProductService{svc: NewStripeService(cfg)}
}

func (s *StripeProductService) SyncProductToStripe(ctx context.Context, p *models.Product) error {
	if p.StripeProductID == "" {
		stripeProduct, err := s.svc.CreateProduct(p.Name, p.Description)
		if err != nil {
			return err
		}
		p.StripeProductID = stripeProduct.ID

		stripePrice, err := s.svc.CreatePrice(stripeProduct.ID, p.Price, "", 0)
		if err != nil {
			return err
		}
		p.StripePriceID = stripePrice.ID
	}
	return nil
}

func (s *StripeProductService) SyncPlanToStripe(ctx context.Context, plan *models.SubscriptionPlan) error {
	if plan.StripeProductID == "" {
		stripeProduct, err := s.svc.CreateProduct(plan.Name, plan.Description)
		if err != nil {
			return err
		}
		plan.StripeProductID = stripeProduct.ID

		stripePrice, err := s.svc.CreatePrice(stripeProduct.ID, plan.Price, plan.Interval, plan.IntervalCount)
		if err != nil {
			return err
		}
		plan.StripePriceID = stripePrice.ID
	}
	return nil
}

func (s *StripeService) ListPaymentIntents(customerID string) ([]*stripe.PaymentIntent, error) {
	params := &stripe.PaymentIntentListParams{}
	if customerID != "" {
		params.Customer = stripe.String(customerID)
	}
	var paymentIntents []*stripe.PaymentIntent
	iter := paymentintent.List(params)
	for iter.Next() {
		paymentIntents = append(paymentIntents, iter.PaymentIntent())
	}
	return paymentIntents, iter.Err()
}
