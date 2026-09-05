# SmartCity 360 — System Architecture

## Overview

SmartCity 360 is a multi-tenant Smart City Management Platform where each **City** is a first-class entity. All resources, users, and data are city-scoped. Only `SUPER_ADMIN` users have global cross-city access.

---

## Architecture Layers

```
┌─────────────────────────────────────────┐
│              Frontend                    │
│   Next.js 14 App Router + TypeScript    │
│   Tailwind CSS + Leaflet Maps           │
│   Axios API Client + Socket.IO Client   │
└────────────────────┬────────────────────┘
                     │ HTTP / WebSocket
┌────────────────────▼────────────────────┐
│              Backend API                 │
│   Express.js + TypeScript               │
│   /api/v1/ versioned REST               │
│   Socket.IO server                      │
│   Helmet, CORS, Rate Limiting           │
│   Zod validation + Winston logging      │
└────────────────────┬────────────────────┘
                     │ Prisma ORM
┌────────────────────▼────────────────────┐
│              PostgreSQL                  │
│   City, User, AuditLog, RefreshToken    │
│   + PostGIS (geospatial)                │
└─────────────────────────────────────────┘
```

---

## Frontend Architecture

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (font, toast)
│   └── page.tsx            # Landing/redirect
│
├── components/
│   ├── ui/                 # Button, Badge, Card, Input
│   ├── layout/             # Navbar, Sidebar, Header
│   ├── map/                # MapView, Marker, Route, Polygon
│   └── states/             # Loading, Error, Empty, Skeleton
│
├── lib/api.ts              # Axios instance + service modules
├── types/index.ts          # Shared TypeScript types
└── utils/cn.ts             # Class merge utility + date utils
```

**Key Frontend Decisions:**
- **Map provider abstraction** — Components (`MapView`, `Marker`, `Route`) never import Leaflet directly in feature code. Swapping providers requires changes only in `components/map/`.
- **API service layer** — All API calls go through `lib/api.ts` (Axios instance with interceptors). Never import axios directly in components.
- **Dynamic map import** — Leaflet requires DOM; use `dynamic(() => import('...'), { ssr: false })` in page components.

---

## Backend Architecture

```
backend/src/
├── config/
│   ├── env.ts              # Zod env validation (fails fast)
│   └── database.ts         # Prisma singleton + connect/disconnect
│
├── constants/
│   ├── app.ts              # API prefix, rate limits, limits
│   ├── roles.ts            # Role enum, Permission enum, isGlobalRole()
│   └── events.ts           # WebSocket event constants, room naming
│
├── controllers/            # Thin HTTP handlers only
│   └── health.controller.ts
│
├── middleware/
│   ├── auth.ts             # authenticate, requireRole, requireCityAccess
│   ├── errorHandler.ts     # Central error handler (never leaks secrets)
│   ├── requestLogger.ts    # Per-request logging with UUID
│   └── validate.ts         # Zod validation middleware factory
│
├── routes/v1/              # /api/v1/ versioned router
│   ├── index.ts
│   ├── health.routes.ts
│   ├── cities.routes.ts
│   ├── users.routes.ts
│   └── auth.routes.ts
│
├── services/
│   ├── ai/AIService.ts           # AI abstraction (Phase 17)
│   ├── audit/AuditLogService.ts  # Audit logging
│   ├── file/FileStorageService.ts # File upload abstraction
│   └── notification/NotificationService.ts
│
├── utils/
│   ├── AppError.ts         # Custom error class + ErrorCode enum
│   ├── logger.ts           # Winston logger
│   └── response.ts         # sendSuccess(), sendError(), pagination
│
├── websocket/index.ts      # Socket.IO setup + city rooms
│
├── app.ts                  # Express factory
└── server.ts               # Entry point + graceful shutdown
```

---

## Request Flow

```
HTTP Request
    ↓
Helmet (security headers)
    ↓
CORS (origin whitelist)
    ↓
Rate Limiter
    ↓
Body Parser (10mb limit)
    ↓
requestLogger (attaches UUID, logs on response)
    ↓
/api/v1/ Router
    ↓
[Future] authenticate middleware (Phase 1)
    ↓
[Future] requireRole() middleware
    ↓
[Future] requireCityAccess() middleware
    ↓
validate() middleware (Zod)
    ↓
Controller (thin handler)
    ↓
Service (business logic)
    ↓
Repository / Prisma (data access)
    ↓
Response (sendSuccess / sendError)
```

---

## City Isolation Architecture

**The most important security constraint:**

```
CITY_ADMIN user.cityId === resource.cityId
```

Enforced by `requireCityAccess()` middleware:

```typescript
// Usage:
router.get('/cities/:cityId/garbage', 
  authenticate,
  requireCityAccess(), // reads req.params.cityId
  handler
);

// Custom extractor (when cityId comes from body/resource):
requireCityAccess((req) => req.body.cityId)
```

`SUPER_ADMIN` role bypasses all city-scope checks via `isGlobalRole()`.

---

## Real-time Architecture

WebSocket rooms:
- `city:<cityId>` — All users in a city
- `city:<cityId>:<service>` — Service-specific room (e.g., `city:abc:garbage`)
- `user:<userId>` — Private user channel

Event contracts are defined in `constants/events.ts`. Phase 7+ will implement emitters.

---

## AI Architecture

```
City Data
    ↓
Normal Service Layer (CRUD)
    ↓ (async, non-blocking)
AIService
    ├── classifyReport()    — Phase 14
    ├── analyzeImage()      — Phase 14
    ├── detectAnomalies()   — Phase 17
    ├── predictDemand()     — Phase 17
    └── getRecommendations()— Phase 18
    ↓
AuditLog (AIEvent)
    ↓
WebSocket Notification
```

**Critical rule:** AI failures must never break normal CRUD operations. AI is called async and wrapped in try/catch.

---

## Service Abstractions (Provider Pattern)

| Service | Interface | Current Provider | Phase |
|---|---|---|---|
| File Storage | `FileStorageProvider` | Cloudinary stub | Phase 14 |
| Notifications | `NotificationProvider` | In-app, push, email, SMS stubs | Phase 15 |
| AI | `AIService` | Stub | Phase 17 |
| Audit | `AuditLogService` | PostgreSQL (Prisma) | Phase 0 |
| Maps | Map components | Leaflet | Phase 3 |

---

## Development Rules

1. City-specific resources must have `cityId` foreign key
2. Never trust `cityId` from request body without authorization
3. Never expose another city's data
4. Business logic in **services**, not controllers
5. Database access in **repositories** (or Prisma calls in services only)
6. All secrets in environment variables
7. Real-time channels must be authenticated (Phase 7+)
8. AI must be isolated from core business logic
9. All new modules follow existing architecture patterns
10. Standard API response format always (sendSuccess/sendError)
