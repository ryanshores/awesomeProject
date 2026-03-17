# E-Commerce Platform

A Shopify-like e-commerce platform with product sales and subscription management built with Go (Gin) backend and React/TypeScript frontend.

## Features

- **Product Management**: Create, update, delete products with stock tracking
- **Shopping Cart**: Add/remove items, quantity management
- **Checkout**: Stripe-powered payment processing
- **Subscriptions**: Recurring subscription plans with Stripe
- **User Authentication**: JWT-based auth with role-based access
- **Admin CMS**: Dashboard, user management, order tracking

## Tech Stack

### Backend
- Go 1.26+ with Gin framework
- PostgreSQL database with GORM
- Stripe for payments & subscriptions
- JWT for authentication

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Stripe.js for checkout
- React Router for navigation

## Getting Started

### Prerequisites

- Go 1.26+
- Node.js 18+
- PostgreSQL
- Stripe account (for payments)

### Backend Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

3. Create PostgreSQL database:
   ```sql
   CREATE DATABASE shop;
   ```

4. Run the server:
   ```bash
   go run ./cmd/server
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env` file:
   ```
   VITE_API_URL=http://localhost:8080/api
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (auth required)

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/admin/products/:id` - Update product (admin)
- `DELETE /api/admin/products/:id` - Delete product (admin)

### Subscriptions
- `GET /api/subscriptions/plans` - List subscription plans
- `GET /api/subscriptions` - Get user subscriptions (auth)
- `POST /api/checkout/subscription` - Create subscription checkout (auth)

### Cart
- `GET /api/cart` - Get cart (auth)
- `POST /api/cart` - Add item to cart (auth)
- `PUT /api/cart/:id` - Update cart item (auth)
- `DELETE /api/cart/:id` - Remove cart item (auth)
- `DELETE /api/cart` - Clear cart (auth)

### Checkout
- `POST /api/checkout/session` - Create checkout session (auth)
- `POST /api/webhook` - Stripe webhook handler

### Admin
- `GET /api/admin/dashboard` - Dashboard stats (admin)
- `GET /api/admin/users` - List users (admin)
- `PUT /api/admin/users/:id` - Update user (admin)
- `GET /api/admin/orders` - List orders (admin)
- `GET /api/admin/subscriptions` - List all subscriptions (admin)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret key for JWT tokens |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `PORT` | Server port |

## License

MIT