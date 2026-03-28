# 🚂 TravelBuddy — NIT Trichy

A web application for NIT Trichy students to find travel companions heading to the same destination. Share cabs, trains, and flights safely and cost-effectively.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS + React Router |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (OAuth-ready) |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
travel-buddy/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Route logic
│   ├── middleware/     # Auth middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── seed.js         # Sample data seeder
│   ├── server.js       # Express entry point
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/ # Reusable UI components
        ├── context/    # React Context (Auth)
        ├── hooks/      # Custom hooks (extendable)
        ├── pages/      # Page-level components
        └── services/   # Axios API layer
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/travel-buddy
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Future OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally or a MongoDB Atlas URI
- npm or yarn

### 1. Clone and install dependencies

```bash
# Backend
cd travel-buddy/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

### 3. Seed sample data (optional)

```bash
cd backend
node seed.js
```

Test credentials after seeding:
- **Email:** `arjun@nitt.edu` | **Password:** `password123`
- **Email:** `priya@nitt.edu` | **Password:** `password123`

### 4. Run development servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev   # runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev   # runs on http://localhost:5173
```

---

## 🗃️ API Reference

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register with @nitt.edu email | ❌ |
| POST | `/api/auth/login` | Login, get JWT | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Trips
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/trips` | List open trips (filterable) | ✅ |
| POST | `/api/trips` | Create a trip | ✅ |
| GET | `/api/trips/:id` | Get trip details | ✅ |
| PUT | `/api/trips/:id` | Update trip (organizer) | ✅ |
| DELETE | `/api/trips/:id` | Cancel trip (organizer) | ✅ |
| GET | `/api/trips/my/organized` | My organized trips | ✅ |
| GET | `/api/trips/my/joined` | My joined trips | ✅ |

### Join Requests
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/join-requests` | Request to join a trip | ✅ |
| GET | `/api/join-requests/my` | My join requests | ✅ |
| GET | `/api/join-requests/trip/:tripId` | Requests for my trip | ✅ |
| PUT | `/api/join-requests/:id/status` | Approve/reject request | ✅ |
| DELETE | `/api/join-requests/:id` | Withdraw request | ✅ |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Get profile | ✅ |
| PUT | `/api/users/profile` | Update name/phone | ✅ |
| GET | `/api/users/history` | Travel history | ✅ |

---

## 🗄️ Database Schemas

### User
```js
{ name, email (@nitt.edu), phone, registerNumber, password (hashed),
  createdTrips[], joinedTrips[], googleId, notificationsEnabled }
```

### Trip
```js
{ organizerId, destination, travelDate, preferredSex, companionUntilStep,
  transportSteps[], additionalDetails, joinRequests[], status, maxCompanions, chatRoomId }
```

### JoinRequest
```js
{ userId, tripId, joinUntilStep, finalDestination, travelDate, message, status }
```

### TransportStep (embedded in Trip)
```js
{ stepNumber, mode (Cab/Train/Flight/Bus/Metro/Auto), from, to, transportName, departureTime }
```

---

## 🔮 Future-Ready Architecture

The codebase is modularly structured to easily add:

| Feature | Where to integrate |
|---------|-------------------|
| **Real-time Chat** | Add `socket.io` to `server.js`, use `chatRoomId` on Trip model |
| **Google Maps** | Add `@googlemaps/js-api-loader` to frontend, replace text inputs with `PlacesAutocomplete` |
| **Push Notifications** | Add `web-push` to backend, use `notificationsEnabled` on User |
| **OAuth (Google)** | Add `passport-google-oauth20`, use `googleId` on User model |
| **Trip Ratings** | Add `Rating` model, link to Trip and JoinRequest |
| **PWA** | Add Vite PWA plugin + service worker |

---

## 🧪 Sample Test Data

After running `node seed.js`:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Arjun Sharma | arjun@nitt.edu | password123 | Organizer |
| Priya Nair | priya@nitt.edu | password123 | User |
| Rohan Mehta | rohan@nitt.edu | password123 | User |

Sample trips:
1. NIT Trichy → Chennai via Cab + Rockfort Express (3 days from now)
2. NIT Trichy → Bangalore via Cab + IndiGo flight (5 days from now, Female only)

---

## 🎨 Design System

- **Font:** Sora (headings) + DM Sans (body)
- **Theme:** Dark mode first (`#0f0f0f` base)
- **Accent:** Brand orange (`#f97316`)
- **Components:** Cards, badges, input fields, buttons — all defined in `index.css` as Tailwind `@layer components`

---

## 📦 Build for Production

```bash
# Frontend
cd frontend
npm run build   # outputs to frontend/dist/

# Backend
cd backend
NODE_ENV=production node server.js
```

---

Built for NIT Trichy students 🎓 | Made with ❤️ and a lot of train rides
