# OmniBite | Premium Multi-Cloud Restaurant Chain Monorepo

OmniBite is a production-grade, enterprise-ready monorepo platform designed for high-scale restaurant franchises or food delivery startups. Featuring decoupled microservices, real-time WebSockets tracking, automated inventory recipes deductions, and an elegant dark-theme React dashboard.

## 🚀 Architectural Overview

This platform implements a pure **microservice-oriented monorepo architecture** utilizing npm workspaces.

```mermaid
graph TD
    Client[React Frontend - Port 3000] -->|HTTP / WS| Gateway[API Gateway - Port 5000]
    
    Gateway -->|Proxy /auth| Auth[Auth Service - Port 5001]
    Gateway -->|Proxy /menu| Menu[Menu Service - Port 5002]
    Gateway -->|Proxy /orders| Order[Order Service - Port 5003]
    Gateway -->|Proxy /inventory| Inventory[Inventory Service - Port 5004]
    Gateway -->|Proxy /loyalty| Loyalty[Loyalty Service - Port 5005]
    Gateway -->|Proxy /notifications| Notification[Notification Service - Port 5006]

    Order -->|Event: order.created| EventBus[EventBus Router]
    EventBus -->|Async Deduct| Inventory
    EventBus -->|Async Award points| Loyalty
    EventBus -->|Trigger Notification| Notification
```

### Core Monorepo Folders
* **`shared/`**: Unified monorepo library containing TS structures, JWT verifiers, centralized HTTP errors middleware, and a resilient Redis-ready caching client with automatic memory fallback.
* **`services/gateway/`**: Single client entry point routing requests to microservices and hosting the socket.io Websocket hub.
* **`services/auth-service/`**: Handles user registrations, bcrypt credentials hashing, and Role-Based Access Control (RBAC).
* **`services/menu-service/`**: Branch assets and menu collections manager. Implements a mock AI-recommendation engine showing user match scores and reasons.
* **`services/order-service/`**: Places orders (Dine-in, Takeaway, Delivery) and handles table QR ordering sessions.
* **`services/inventory-service/`**: Tracks ingredient stocks per branch. Subscribes to the EventBus to deduct stocks automatically and fires low-stock events.
* **`services/loyalty-service/`**: Manages promo discount coupons and customer loyalty points cards. Recalculates user tiers on completions.
* **`services/notification-service/`**: Dispatches real-time web socket alerts to the gateway and logs events to MongoDB.

---

## 🛠️ Technology Stack

1. **Frontend**: React + Vite + Tailwind CSS (lucide-react, socket.io-client)
2. **Backend Services**: Node.js + Express + TypeScript
3. **Database Layer**: MongoDB with Mongoose (Separate databases per service)
4. **Caching Layer**: Redis (Automatic in-memory fallback included!)
5. **Real-time Engine**: WebSockets via Socket.io
6. **Communication**: EventBus Pub/Sub

---

## ⚡ Quick Start & Development Run

Follow these simple steps to spin up the entire architecture in development.

### 1. Prerequisites
Ensure you have Node.js (v18+) and a local MongoDB instance running at `mongodb://localhost:27017`.

### 2. Workspace Setup & Installation
Run standard npm installs at the root directory. This will scan all workspaces, pull dev dependencies, and link the local workspaces automatically:
```bash
npm install
```

### 3. Compile Shared Utilities
Compile the core shared module so its declarations and compiled files are available:
```bash
npm run build -w shared
```

### 4. Seed the Platform Databases
Run our master database seeder. This will connect to all isolated service databases, clear previous logs, and insert high-quality test data:
```bash
npm run seed
```
*Seeded Accounts for Testing (Password is `password123` for all):*
- **Super Admin (CEO)**: `superadmin@restaurant.com`
- **Branch Admin (Manager)**: `admin@restaurant.com`
- **Chef (Kitchen Staff)**: `kitchen@restaurant.com`
- **Customer (Jim)**: `customer@restaurant.com`

### 5. Start the Monorepo
Spin up all 7 backend services + the Vite frontend simultaneously using our unified launch command:
```bash
npm run dev
```
The React frontend dashboard will boot on [http://localhost:3000](http://localhost:3000) and the API Gateway will be listening on [http://localhost:5000](http://localhost:5000).

---

## 🔒 Verification & Tests

To compile the entire monorepo TypeScript base to production distributions:
```bash
npm run build
```
You can query direct microservice endpoints (e.g. `http://localhost:5001/health` or `http://localhost:5000/health` for the Gateway) to verify health checks.
