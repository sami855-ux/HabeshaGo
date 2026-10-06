# HabeshaGo 🚍

A modern bus transportation and ticket booking platform designed to simplify travel management for passengers, transport companies, and administrators. HabeshaGo provides a seamless experience for searching routes, booking tickets, managing schedules, tracking vehicles, and handling transportation operations efficiently.

## Overview

HabeshaGo is a comprehensive transportation management system that enables passengers to book bus tickets online while allowing administrators and transport operators to manage routes, vehicles, schedules, and bookings from a centralized platform.

The platform aims to modernize transportation services by reducing manual processes, improving accessibility, and enhancing the overall travel experience.

## Features

### Passenger Features
- User registration and authentication
- Search available routes and schedules
- Online ticket booking
- View booking history
- Download or print tickets
- Receive travel notifications
- Manage user profile

### Transportation Management
- Route management
- Schedule management
- Vehicle management
- Seat allocation system
- Fare management
- Driver and staff management

### Real-Time Features
- Vehicle tracking
- Real-time travel updates
- Booking status notifications
- Live seat availability

### Admin Features
- Dashboard and analytics
- User management
- Booking management
- Route and schedule management
- Revenue monitoring
- System configuration
- Report generation


## 🏗️ System Architecture

The application follows a modern full-stack architecture:

### Web Frontend
- React.js / Next.js
- Redux Toolkit
- Tailwind CSS
- Framer Motion

### Mobile Application
- React Native

### Backend
- Node.js
- Express.js
- Socket.io

### Database
- PostgreSQL / Supabase

### Authentication
- JWT Authentication
- Role-Based Access Control (RBAC)
- Staff email/password authentication with Google Authenticator TOTP and
  single-use recovery phrases

### Staff MFA configuration

The backend requires a dedicated 32-byte key for encrypting authenticator
secrets. Generate one for each environment and store it in the server's secret
manager or local `.env` file:

```bash
openssl rand -base64 32
```

Set the result as `MFA_ENCRYPTION_KEY`, then apply the database migration before
starting the server:

```bash
cd server
npx prisma migrate deploy
```

Do not reuse `JWT_SECRET` as the MFA encryption key, and do not commit the key.

---

## 🚀 Getting Started

### Prerequisites

Before running the project, ensure you have:
- Node.js (v18+)
- npm or Yarn
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sami855-ux/HabeshaGo.git
   cd habeshago
