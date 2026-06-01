# Tech Context

## Technologies Used
- **Framework**: Next.js 16.2.6 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Neon Serverless)
- **ORM**: Prisma 5.22.0
- **Authentication**: NextAuth.js 4.24.14
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Validation**: Zod
- **Charts**: Recharts 3.8.1
- **Export**: xlsx 0.18.5 (Excel export)
- **Execution**: Node.js (v20+), `tsx` for scripts

## Next.js 16/React 19 Patterns
- **Server Actions**: Used for all database mutations with role-based access control.
- **Cache Revalidation**: Using `revalidateTag(tag, "max")` in Server Actions to maintain data freshness.
- **Form States**: Leveraging `useActionState` and `useFormStatus` for robust form handling and feedback.

## Development Setup
- **Package Manager**: npm
- **Database Connection**: `DATABASE_URL` via environment variables.
- **Auth Secret**: `NEXTAUTH_SECRET` for JWT signing.
- **Prisma Client**: Generated locally via `npx prisma generate`.
- **Seeding**: `npm run seed` (executes `tsx prisma/seed.ts`).

## Technical Constraints
- **Neon DB Connections**: Leveraging Prisma's connection pooling for serverless environments.
- **ESM Compatibility**: The project uses ES modules; all TypeScript scripts must be run with `tsx` to avoid syntax errors.
- **NextAuth Callbacks**: JWT and Session callbacks are configured to expose user `id` and `role` to both client and server.

## Dependencies
- `bcryptjs`: Password hashing.
- `@auth/prisma-adapter`: Connecting NextAuth to the database.
- `date-fns`: Date manipulation for reports (recommended for future enhancement).

## Tool Usage Patterns
- **Prisma Studio**: `npx prisma studio` for manual data inspection.
- **Prisma Migrate/Push**: `npx prisma db push` for schema updates during development.
- **ESLint**: Standard Next.js rules for code quality.

## Project Structure & Patterns
- **Modular Organization**: Features organized into separate route directories (app/daily-logs/, app/egg-quality/, app/finance/, app/sales/, app/reports/)
- **Component Library**: Reusable UI components (ExportButton, PrintButton, NavWrapper, RevenueChart, SessionProvider, Sidebar) shared across features
- **Form Components**: Specialized form components (EggQualityForm, DailyLogForm, ExpenseForm, SaleForm) with Zod validation
- **Server Actions**: Centralized data mutation logic with role-based access control in each feature directory