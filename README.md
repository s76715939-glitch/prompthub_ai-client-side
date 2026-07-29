# PromptHub AI — AI Prompt Marketplace & Management Platform

PromptHub AI is a full-stack web application designed for discovering, sharing, bookmarking, reviewing, and monetizing high-quality AI prompts (ChatGPT, Midjourney, Claude, Gemini, Stable Diffusion, and DALL-E). Built with modern web technologies, it features role-based access control (Users, Creators, Admins), Stripe payments, Google OAuth, Gemini AI prompt enhancement, dark/light theme switching, and a decoupled client-server architecture.

---

## 🚀 Key Features

### 🔐 Authentication & User Roles

- **JWT Authentication & Password Hashing**: Secure user registration and login with `bcryptjs` and `jsonwebtoken`.
- **Google OAuth 2.0 Integration**: One-click sign-in using Google accounts.
- **Role-Based Access Control (RBAC)**:
  - **User**: Search, browse, copy, review, bookmark prompts, and upgrade to Premium.
  - **Creator**: Create, publish, manage, and track custom prompts with earnings analytics.
  - **Admin**: Moderate prompts (approve/reject/feature), manage users, resolve user reports, and view system-wide revenue analytics.

### 💡 Core Marketplace & Discovery

- **Comprehensive Prompt Directory**: Filter prompts by category, AI platform (ChatGPT, Midjourney, Claude, etc.), tags, and search keywords.
- **Instant Search & Dynamic Pagination**: Fast filtering with skeleton loading states.
- **Prompt Details & Copy Utility**: One-click copy with incrementing copy analytics, variables preview, and rating system.
- **Bookmarks & Saved Prompts**: Save favorite prompts for quick access in the user dashboard.
- **Reviews & Ratings**: Rate prompts (1–5 stars) and post feedback.
- **Content Reporting**: Flag inappropriate or non-functional prompts for admin review.

### 💳 Stripe Payments & Premium Membership

- **Stripe Checkout Integration**: Seamless payment session creation and instant activation.
- **Lifetime Premium Access**: Unlocks exclusive premium prompts, ad-free experience, and creator tools.
- **Automated Verification**: Real-time webhook and session verification.

### 🎨 Flat Modern UI / UX Design

- **Responsive Theme Engine**: Eye-friendly Light and Dark modes with instant toggle and smooth CSS transitions.
- **Toast Notifications**: Non-intrusive feedback toasts for all user actions.
- **Skeleton Loaders**: Polished visual loading indicators.

## 🛠️ Technology Stack

### **Frontend (Client)**

- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **State & Context**: React Context API (`AuthContext`, `ThemeContext`)
- **API Fetcher**: Custom decoupled `apiFetch` wrapper with automatic JWT `Authorization: Bearer <token>` injection

### **Backend (Server)**

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (`jsonwebtoken`) & Google Auth Library (`google-auth-library`)
- **Payments**: Stripe Node SDK (`stripe`)
- **AI Integration**: Google Gemini SDK (`@google/genai`)
- **Security & CORS**: Dynamic CORS whitelist supporting standalone client and server hosting

---

## 🔐 API Endpoint Reference

| Method    | Endpoint                                | Description                                   | Access        |
| :-------- | :-------------------------------------- | :-------------------------------------------- | :------------ |
| **POST**  | `/api/auth/register`                    | Register a new user                           | Public        |
| **POST**  | `/api/auth/login`                       | Login with credentials                        | Public        |
| **POST**  | `/api/auth/google`                      | Google OAuth authentication                   | Public        |
| **GET**   | `/api/auth/me`                          | Fetch current user profile                    | Authenticated |
| **PUT**   | `/api/auth/profile`                     | Update user profile details                   | Authenticated |
| **GET**   | `/api/prompts`                          | Get all approved prompts (filtered/paginated) | Public        |
| **GET**   | `/api/prompts/:id`                      | Get details of a single prompt                | Public        |
| **POST**  | `/api/prompts`                          | Create a new prompt                           | Authenticated |
| **POST**  | `/api/prompts/:id/bookmark`             | Bookmark / unbookmark prompt                  | Authenticated |
| **POST**  | `/api/prompts/:id/reviews`              | Add a review/rating                           | Authenticated |
| **POST**  | `/api/prompts/:id/report`               | Report a prompt                               | Authenticated |
| **POST**  | `/api/payments/create-checkout-session` | Create Stripe checkout session                | Authenticated |
| **POST**  | `/api/payments/verify-session`          | Verify Stripe payment success                 | Authenticated |
| **GET**   | `/api/admin/analytics`                  | Get admin overview statistics                 | Admin Only    |
| **GET**   | `/api/admin/users`                      | List all registered users                     | Admin Only    |
| **PATCH** | `/api/admin/prompts/:id/approve`        | Approve prompt for listing                    | Admin Only    |
| **PATCH** | `/api/admin/prompts/:id/reject`         | Reject prompt with reason                     | Admin Only    |

---
