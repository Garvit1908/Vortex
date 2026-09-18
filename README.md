# Vortex — Elite Freelance & Service Provider Marketplace Platform

Vortex is a production-grade, full-stack digital service marketplace connecting clients with top-tier freelance providers. Built with guaranteed **100% Escrow Protection** (powered by Razorpay in test mode), **real-time Socket.IO collaboration and notifications**, **reputation-backed provider verification badges**, and **admin dispute arbitration**.

---

## 🚀 Tech Stack

- **Frontend**: React 18 (Vite) + Tailwind CSS + Lucide Icons + React Router DOM v6
- **Backend**: Node.js + Express (MVC Architecture)
- **Database**: MongoDB + Mongoose Schemas & Aggregations
- **Real-Time Communication**: Socket.IO (Order room chat, typing indicators & instant notifications)
- **Authentication**: JWT (Access Token + Refresh Token in HTTP-only cookie), bcryptjs for password hashing
- **Payments**: Razorpay in **TEST MODE only** (with simulated fallback for test environments)

---

## 📁 Monorepo Project Structure

```
Vortex/
├── README.md                      # Complete setup & operational guide
├── package.json                   # Root monorepo orchestration scripts
├── server/
│   ├── .env.example               # Required environment variable templates
│   ├── package.json
│   ├── server.js                  # Express application + Socket.IO server setup
│   ├── config/
│   │   ├── db.js                  # MongoDB connection logic
│   │   └── razorpay.js            # Razorpay SDK initialization
│   ├── controllers/
│   │   ├── authController.js      # Register, login, JWT refresh, session logout
│   │   ├── userController.js      # Profile CRUD, skills tags, portfolio, photo upload
│   │   ├── gigController.js       # Gig listing CRUD, search, filter, pagination
│   │   ├── orderController.js     # State-machine orders, deliverables, release actions
│   │   ├── chatController.js      # Message persistence & order chat history
│   │   ├── reviewController.js    # Verified reviews & rating aggregation
│   │   ├── paymentController.js   # Razorpay test order & HMAC signature verification
│   │   ├── adminController.js     # Platform metrics, user verification toggle, dispute arbitration
│   │   └── notificationController.js # In-app notification polling & read state
│   ├── middleware/
│   │   ├── auth.js                # JWT token & role authorization guards
│   │   ├── error.js               # Centralized error handler with standard JSON responses
│   │   ├── rateLimiter.js         # Auth and API rate limiters
│   │   ├── upload.js              # Multer disk upload for avatars and work deliverables
│   │   └── validator.js           # Express-validator result parser
│   ├── models/
│   │   ├── User.js                # Users, roles (client, provider, admin), badges, wallet
│   │   ├── Gig.js                 # Service listings, pricing, delivery days, tags
│   │   ├── Order.js               # Order state machine, escrow status, payment IDs
│   │   ├── Message.js             # Chat messages tied to orders
│   │   ├── Review.js              # Ratings (1-5) and reviews
│   │   └── Notification.js        # In-app notifications
│   ├── routes/                    # Express REST endpoints
│   └── utils/
│       ├── token.js               # JWT token generator and validator
│       └── razorpayHelper.js      # HMAC SHA256 signature verification
└── client/
    ├── package.json
    ├── vite.config.js             # Vite configuration with /api and /socket.io proxies
    ├── tailwind.config.js         # Custom dark brand theme & glow shadows
    ├── src/
        ├── api/                   # Axios client with automatic JWT token refresh interceptor
        ├── components/            # Shared UI (Navbar, Footer, Modal, Badge, RatingStars, Spinner)
        ├── context/               # AuthContext, SocketContext, NotificationContext
        ├── features/
        │   ├── auth/              # Login, Register, ProtectedRoute, RoleRoute
        │   ├── profile/           # ProfilePage, EditProfileModal
        │   ├── listings/          # GigCard, GigDetailPage, CreateGigPage, MyGigsPage, SearchFilterBar
        │   ├── orders/            # OrdersListPage, OrderDetailPage (Command Center)
        │   ├── chat/              # OrderChat (Real-time Socket.IO chat)
        │   ├── reviews/           # ReviewModal
        │   ├── admin/             # AdminDashboard (Analytics, User Verification, Dispute Mediation)
        │   └── ai-stub/           # AIMatchingStub (Placeholder route with TODO comments)
        ├── pages/                 # HomePage, ExplorePage, FreelancersPage, NotFoundPage
        ├── App.jsx
        └── main.jsx
```

---

## ⚙️ How to Run Locally

### Prerequisites
- **Node.js**: v18 or later
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)

### 1. Environment Variables Configuration
Copy the template in `/server/.env.example` to `/server/.env`:

```bash
# In /server/.env:
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/vortex
JWT_SECRET=vortex_dev_jwt_access_secret_key_secure_32chars
JWT_REFRESH_SECRET=vortex_dev_jwt_refresh_secret_key_secure_32chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_placeholder_key_id
RAZORPAY_KEY_SECRET=placeholder_secret_key
```

### 2. Install Dependencies
Install packages for both server and client:

```bash
# From the root directory:
npm run install:all

# Or separately:
cd server && npm install
cd ../client && npm install
```

### 3. Start the Application
You can run both services from the root or in separate terminals:

```bash
# Terminal 1 - Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2 - Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
```

### 4. User Onboarding & Testing Roles
Create accounts directly through the `/register` page:
- **Client**: Browse services, commission gigs, fund escrow milestones with Razorpay (test mode), and review delivered assets.
- **Provider**: Publish service gigs, set delivery timelines and pricing, collaborate via real-time order chat, and submit deliverables.
- **Admin**: Access platform overview, approve/verify provider badges, and arbitrate milestone disputes.

---

## 🔒 Security & Quality Standards

- **JWT Access/Refresh Flow**: 15-minute access token in memory/headers + 7-day secure HTTP-only refresh cookie.
- **Role-Based Access Control**: Strict route guarding for `client`, `provider`, and `admin`.
- **Input Validation**: Express-validator on all endpoints sanitizing bodies and query parameters.
- **Error Handling**: Uniform `{ success: false, message, errors }` format with stack traces hidden in production.
- **Security Headers**: Helmet configured with cross-origin resource policy for uploaded asset rendering.
- **Rate Limiting**: Express-rate-limit protecting `/api/auth` endpoints against brute-force attacks.

---

## 🔄 Escrow Lifecycle Flow

```
1. CLIENT BOOKS GIG         ──> Status: 'pending', Escrow: 'unpaid'
2. PROVIDER ACCEPTS         ──> Status: 'accepted'
3. CLIENT PAYS (RAZORPAY)   ──> Status: 'in-progress', Escrow: 'held_in_escrow'
4. PROVIDER DELIVERS WORK   ──> Status: 'delivered' (Upload file + notes)
5. CLIENT APPROVES DELIVERY ──> Status: 'completed', Escrow: 'released_to_provider'
                              (Funds disbursed to provider wallet balance)
   OR
   DISPUTE RAISED           ──> Status: 'disputed' (Escrow frozen, Admin arbitrates)
```

---

## 🤖 AI Resume-Parsing & Job-Matching Feature
As specified in requirements, the AI matching feature is stubbed with clean placeholder routes and frontend UI:
- Backend: `server/routes/aiRoutes.js` (`POST /api/ai/match` and `POST /api/ai/parse-resume` with `// TODO` markers)
- Frontend: `client/src/features/ai-stub/AIMatchingStub.jsx` (Accessible via the "AI Match" badge in the navigation bar)
