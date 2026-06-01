# System Patterns

## Architecture Overview
The application follows a standard Next.js 16 App Router architecture, leveraging Server Components for data fetching and Server Actions for mutations.

## Key Technical Decisions
1.  **Server-First Data Fetching**: Data for Dashboard and Reports is fetched directly in Server Components using Prisma, reducing client-side load and eliminating extra API boilerplate.
2.  **Role-Based Access Control (RBAC)**:
     -   **Auth**: NextAuth.js with Credentials provider and JWT strategy.
     -   **Permissions**: `ADMIN` vs `USER` (Staff).
     -   **Enforcement**: 
         -   Pages/Layouts: `getServerSession` checks.
         -   Server Actions: `getSession` checks + role validation.
         -   Components: `useSession` for conditional UI rendering.
3.  **Data Validation**: Zod schemas are shared between frontend forms and backend actions.
4.  **Modular File Organization**: Features are organized into separate route directories (app/daily-logs/, app/egg-quality/, etc.) for better maintainability and team collaboration.

## Design Patterns
- **Repository Pattern (via Prisma)**: Direct interaction with the database through a singleton Prisma client.
- **Strategy Pattern (via NextAuth)**: Flexible authentication providers.
- **Action State Pattern**: Using `useActionState` to manage form states, errors, and loading indicators.
- **Component Library Pattern**: Reusable components for forms, buttons, charts, and layout.

## Component Relationships
- **Layout**: Wraps all pages with `SessionProvider` and `Sidebar`.
- **Forms**: Standalone Client Components (`EggQualityForm`, `DailyLogForm`, etc.) that interact with shared Server Actions.
- **Reports**: A central page that aggregates data from multiple Prisma models (`EggLog`, `DailyLog`, `Sale`, `Expense`).
- **Component Library**: Reusable UI components (ExportButton, PrintButton, NavWrapper, RevenueChart, etc.) used across features.

## Critical Implementation Paths
1.  **Data Entry**: Client Form -> Zod Validation -> Server Action -> RBAC Check -> Prisma Create -> Cache Revalidation (`revalidateTag`).
2.  **Dashboard/Reporting**: Server Component -> Concurrent Prisma Queries (`Promise.all`) -> Data Aggregation -> React Rendering.