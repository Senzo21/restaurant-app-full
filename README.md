# 🍔 Restaurant Food Ordering App (React Native + Firebase + Stripe)

This is a **mobile restaurant food ordering application** built using **React Native (Expo)** with **Firebase** for authentication and database management, and a **Node.js Stripe backend** for handling payments.

The app supports **normal users and admins**, enforces **registration before ordering**, and includes a **feature-rich admin dashboard**.

---

## 📱 Application Overview

The application allows users to:
- Register and log in
- Browse food items
- Add items to a cart
- Place orders securely
- Make payments using Stripe (test cards)

Admins can:
- Access a protected admin dashboard
- View total users, orders, and revenue
- Manage menu items (add, edit, delete)
- View recent orders and analytics
- Log out securely without redirecting to Home

---

## 🧩 Tech Stack

### Frontend
- React Native (Expo)
- React Navigation (Native Stack)
- Firebase Authentication
- Firebase Firestore
- React Native Paper
- Stripe React Native SDK

### Backend
- Node.js
- Express
- Stripe API
- dotenv

---

## 🔐 User Roles & Access Control

### Normal Users
- Must register before placing orders
- Can access Home, Cart, Checkout, and Receipt screens
- Cannot access Admin Dashboard

### Admin
- Has exclusive access to the Admin Dashboard
- Never redirects to Home automatically
- Logs out directly to the Login screen

Unregistered users **cannot place orders**.

---

## 🎨 UI Design

- Login & Register screens use a **dark theme** with restaurant vibes
- Admin Dashboard uses a **modern, analytics-focused layout**
- Clean cards, charts, and metrics

---

## 💳 Payments (Stripe)

Payments are handled using Stripe with a Node.js backend.

### Test Card
```
4242 4242 4242 4242
Any future expiry date
Any 3-digit CVC
```

---

## ⚙️ Setup Instructions

### Frontend
```bash
npm install
npx expo start
```

### Backend
```bash
cd stripe-backend
npm install
npm start
```

Create `.env`:
```
STRIPE_SECRET_KEY=your_key_here
PORT=4242
```

---

## 🌿 Git Workflow

- Multiple branches
- Clean commit history
- Backend merged into main branch

---

## 🎓 Purpose

This project demonstrates:
- Mobile app development
- Firebase authentication & Firestore
- Role-based access control
- Stripe payment integration
- Professional Git workflow

---

 
