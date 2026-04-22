# KOEN Stage 3 Subtasks: Multi-user & Collaborative Loops

This document tracks the execution details for Stage 3.

## Phase 3.1: Invitation & Identity (CURRENT)

### Backend
- [ ] **Prisma Schema Update**
    - Add `passwordHash` (String) to `User`.
    - Add `role` (Enum: ADMIN, WORKER) to `User`.
    - Add `isActive` (Boolean) to `User`.
    - New `Invitation` model:
        - `id` (UUID)
        - `email` (String, Unique)
        - `token` (String, Unique)
        - `role` (Enum: ADMIN, WORKER)
        - `expiresAt` (DateTime)
        - `status` (Enum: PENDING, ACCEPTED, EXPIRED)
- [ ] **Auth Module**
    - `POST /auth/login`: Validate email/password, return JWT.
    - `POST /auth/signup`: Accepts `token`, `name`, `password`. Validates token before creating user.
    - `GET /auth/me`: Returns current user info.
- [ ] **Invitation Module**
    - `POST /invitations`: (Admin Only) Create a new invitation and return the token.
    - `GET /invitations/:token`: Validate if a token is still active/valid.

### Frontend
- [ ] **Auth Flow**
    - `Login` page: Email/Password inputs.
    - `Signup` page: Only accessible via `?token=...`.
- [ ] **State Management**
    - Store JWT in `localStorage` or `HttpOnly` cookie.
    - Add `api` interceptor for `Authorization` header.

## Phase 3.2: Account Migration
- [ ] Replace `STAGE1_USER_ID` with dynamic user context.
- [ ] Protect all existing endpoints with `JwtAuthGuard`.

## Phase 3.3: DigitalOcean Spaces Migration
- [ ] Implement `StorageService` using AWS-SDK-v3.
- [ ] Update `RecordsService` to upload to the cloud.

## Phase 3.4: Team Collaboration (Sharing)
- [ ] Implement `ProjectMember` many-to-many model.
- [ ] Add "Invite Team Member" UI to projects.

## Phase 3.5: Social Features (Comments)
- [ ] Implement site-note commenting system.
