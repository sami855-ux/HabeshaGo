# HabeshaGo 🚍

A modern bus transportation and ticket booking platform designed to simplify travel management for passengers, transport companies, and administrators. HabeshaGo provides a seamless experience for searching routes, booking tickets, managing schedules, tracking vehicles, and handling transportation operations efficiently.


---

# Overview

HabeshaGo is a comprehensive transportation management system that enables passengers to book bus tickets online while allowing administrators and transport operators to manage routes, vehicles, schedules, and bookings from a centralized platform.

The platform aims to modernize transportation services by reducing manual processes, improving accessibility, and enhancing the overall travel experience.


---

# Features

👤 Passenger Features

User registration and authentication

Search available routes and schedules

Online ticket booking

View booking history

Download or print tickets

Receive travel notifications

Manage user profile


🚌 Transportation Management

Route management

Schedule management

Vehicle management

Seat allocation system

Fare management

Driver and staff management


📍 Real-Time Features

Vehicle tracking

Real-time travel updates

Booking status notifications

Live seat availability


🛡️ Admin Features

Dashboard and analytics

User management

Booking management

Route and schedule management

Revenue monitoring

System configuration

Report generation



---

🏗️ System Architecture

The application follows a modern full-stack architecture:

Frontend

React.js / Next.js

Redux Toolkit

Tailwind CSS

Framer Motion


Backend

Node.js

Express.js

Socket.io


Database

PostgreSQL / Supabase


Authentication

JWT Authentication

Role-Based Access Control (RBAC)



---

🚀 Getting Started

Prerequisites

Before running the project, ensure you have:

Node.js (v18+)

npm or Yarn

PostgreSQL database

Git


Installation

Clone the repository

git clone https://github.com/yourusername/habeshago.git
cd habeshago

Install dependencies

npm install

or

yarn install

Configure environment variables

Create a .env file in the root directory:

PORT=5000

DATABASE_URL=your_database_url

JWT_SECRET=your_jwt_secret

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

CLIENT_URL=http://localhost:3000

Run the application

Development mode:

npm run dev

Production mode:

npm run build
npm start


---

📂 Project Structure

HabeshaGo/
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── hooks/
│   └── utils/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   └── sockets/
│
├── public/
├── docs/
├── .env
└── README.md


---

🔐 User Roles

Passenger

Search routes

Book tickets

Manage bookings

View travel history


Operator

Manage buses

Manage schedules

Track bookings

Update trip status


Administrator

Manage users

Manage routes

Monitor system activity

Generate reports

Configure platform settings



---

📊 Future Enhancements

Mobile application

QR code ticket verification

Digital payment integration

AI-powered route recommendations

Multi-language support

Advanced analytics dashboard

Offline ticket validation



---

🤝 Contributing

Contributions are welcome.

1. Fork the repository


2. Create a feature branch



git checkout -b feature/new-feature

3. Commit your changes



git commit -m "Add new feature"

4. Push to your branch



git push origin feature/new-feature

5. Open a Pull Request




---

📜 License

This project is licensed under the MIT License.


---

👨‍💻 Author

Sam

Full Stack Developer passionate about building scalable web applications and digital solutions that improve everyday experiences.


---

⭐ If you find this project useful, consider giving it a star! 🚍✨
