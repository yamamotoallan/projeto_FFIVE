# Implementation Plan - Fix Vercel Deployment & API Communication

The goal is to fix the "communication error with server" by ensuring the Frontend (Vercel) correctly talks to the Backend (Railway).

## User Review Required
> [!IMPORTANT] 
> This change involves cleaning up `vercel.json` to remove legacy "builds" configuration. This is recommended by Vercel to avoid conflicts.

## Proposed Changes

### Configuration
#### [MODIFY] [vercel.json](file:///c:/Users/YF/Downloads/marcenaria-pro/vercel.json)
- Remove `builds` key (Legacy).
- Remove `routes` key (Legacy).
- Simplify `rewrites` or remove it entirely if we want to force usage of `VITE_API_URL`.
    - *Decision*: Since we want to use Railway, we should NOT rely on Vercel rewrites for `/api` unless we want to proxy.
    - However, `VITE_API_URL` in `src/config/api.ts` is `import.meta.env.VITE_API_URL || ''`.
    - If `src/services/api.ts` hardcodes `'/api'`, it breaks when `VITE_API_URL` is set in environment but not used by the variable.
    - I found `src/services/api.ts` currently has `const API_URL = '/api';` hardcoded! This is the BUG. It MUST import from config.

#### [MODIFY] [src/services/api.ts](file:///c:/Users/YF/Downloads/marcenaria-pro/src/services/api.ts)
- Replace `const API_URL = '/api';` with import from `src/config/api.ts`.
- This ensures it picks up the environment variable.

#### [MODIFY] [src/config/api.ts](file:///c:/Users/YF/Downloads/marcenaria-pro/src/config/api.ts)
- Ensure it handles the case where `VITE_API_URL` is missing by warning locally or defaulting carefully.

### Documentation
#### [MODIFY] [GUIA_MIGRACAO_RAILWAY.md](file:///c:/Users/YF/Downloads/marcenaria-pro/GUIA_MIGRACAO_RAILWAY.md)
- Add a specific troubleshooting note about `VITE_API_URL`.

## Verification Plan

### Manual Verification
- Deploy to Vercel (User action).
- Access the Vercel URL.
- Open Browser Console.
- Verify that network requests go to `https://....railway.app/api/...` and NOT `https://....vercel.app/api/...`.
