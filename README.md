# Auto Mohamed Nabil V2
# Performax 1 Agency | معرض محمد نبيل للسيارات

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with real credentials
node seed_admin.js  # Create admin user in DB
npm run dev
```

## API Endpoints

### Public
- `GET  /health` — health check
- `GET  /api/cars` — list cars (with filters)
- `GET  /api/cars/featured` — featured cars
- `GET  /api/cars/search?q=` — search
- `GET  /api/cars/:slug` — car detail
- `POST /api/inquiries` — submit inquiry

### Admin (requires Bearer token)
- `POST   /api/auth/login`
- `GET    /api/auth/me`
- `POST   /api/auth/logout`
- `GET    /api/analytics/overview`
- `GET    /api/cars/admin/all`
- `POST   /api/cars/admin`
- `PUT    /api/cars/admin/:id`
- `DELETE /api/cars/admin/:id`
- `GET    /api/inquiries`
- `PATCH  /api/inquiries/:id/status`
