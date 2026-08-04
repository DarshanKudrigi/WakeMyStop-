# 🚆 RailAlert AI — Smart Journey Assistant & Real-Time Train Tracker

**RailAlert AI** is a modern, Apple-inspired smart train tracking platform built for everyday passengers. It combines real-time train route monitoring, live station board schedules, smart destination alarms, and a production-ready **RailRadar API** integration layer.

---

## ✨ Features

- 🚆 **Real-Time Train Tracking**: Interactive vertical railway track timeline displaying official halts, platform numbers, distance markers, and live delay status.
- 🔔 **Smart Destination Alarms**: Custom station alerts (SMS, WhatsApp, sound alarms, vibration) before reaching your destination stop so you never miss a station.
- 📊 **Active Journey Lifecycle Engine**: Centralized reactive state management tracking journey states (`Planned`, `Active`, `Completed`, `Cancelled`) with single-active-journey enforcement.
- 📱 **Collapsible Search & Sticky Controls**: Collapsible search header that smoothly hides on scroll to maximize mobile screen real estate.
- 🌙 **Deep Charcoal Dark Mode**: High-contrast, Apple/GitHub Dark-inspired theme that is easy on the eyes during nighttime travel.
- ⚡ **API Abstraction & Caching**: Built-in TTL caching, in-flight request deduplication, and fallback mock adapters for zero API credit wastage during development.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **State Management**: React Context (`JourneyContext`, `ThemeContext`)

### Backend & API
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens) + bcrypt
- **External Integration**: RailRadar REST API v1.0

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in both `backend` and `frontend` folders before running the app.

### Backend (`backend/.env`)
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAILRADAR_API_KEY=your_railradar_api_key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
VITE_RAILRADAR_API_KEY=your_railradar_api_key
```

---

## 🚀 Installation & Running the Project

### 1. Clone the Repository
```bash
git clone https://github.com/DarshanKudrigi/WakeMyStop.git
cd WakeMyStop
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Run Development Servers

**Backend Server (Runs on `http://localhost:3000`):**
```bash
cd backend
npm run dev
```

**Frontend Server (Runs on `http://localhost:5173`):**
```bash
cd frontend
npm run dev
```

---

## 📁 Project Structure (Brief)

```text
WakeMyStop/
├── backend/
│   ├── src/
│   │   ├── config/             # DB & Environment Config
│   │   ├── controllers/        # Route Handlers
│   │   ├── middleware/         # Auth & Validation
│   │   ├── models/             # Database Models
│   │   ├── routes/             # API Routes
│   │   └── services/           # RailRadar API Integration & Caching Layer
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # Dashboard, Route Timeline, Sticky Footer
│   │   ├── context/            # JourneyContext, ThemeContext
│   │   ├── pages/              # Dashboard, SearchResults, TrainDetails, Preferences
│   │   └── services/           # Journey Engine, Auto-Refresh, Notification Service
│   └── .env.example
└── docs/                       # Architecture Guides & Payload Documentation
```

---

## 🔮 Future Improvements

- 💬 **Crowd-Sourced Live Location**: Real-time position sharing from passengers inside the train.
- 📞 **Automated IVR Phone Call Alarms**: Fallback voice call alerts for sleeping passengers in poor data connectivity zones.
- 📱 **Mobile Native Apps**: React Native iOS and Android application builds.

---

---

## 📄 License

This project is licensed under the MIT License.

---

If you found this project useful, consider giving it a ⭐ on GitHub.
