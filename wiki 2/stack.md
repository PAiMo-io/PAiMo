# Tech Stack Overview

This document provides a high-level overview of the main technologies used in this project.

## Framework

- **Next.js 14** with the app router (`app/` directory) for server-side rendering and routing.
- **React 18** as the UI library.
- **TypeScript** for type-safe JavaScript development.

## Authentication

- **NextAuth** with Google and credentials providers (`auth.ts`).
- Sessions and JWT callbacks extend user details for roles and profile data.

## Database

- **MongoDB** accessed through **Mongoose** (`utils/mongoose.ts`). Models are defined in `models/` for users, clubs, events and more.

## Styling & UI

- **Tailwind CSS** configured in `tailwind.config.ts` and `app/globals.css`.
- **shadcn/ui** components (Radix UI based) with paths defined in `components.json`.
- **Lucide** icon library.

## Emails & Notifications

- **Resend** API for sending registration and password reset emails (see `app/api/register/route.ts`).

## Storage

- **Cloudflare R2** (S3-compatible) accessed through `@aws-sdk/client-s3`. Used to store user avatars via `scripts/updateMissingAvatars.ts`.

## Other Libraries

- **BcryptJS** for hashing passwords.
- **Day.js** for date utilities.
- **Axios** for HTTP requests.
- **Boring Avatars** to generate fallback user avatars.

## Tooling

- ESLint via `npm run lint`.
- Build process using `next build` via `npm run build`.
- Scripts for seeding data and filling avatars are in `scripts/`.

## Configuration

- Environment variables (see `README.md` for examples) configure database connection, authentication secrets, Resend API key and R2 credentials.

