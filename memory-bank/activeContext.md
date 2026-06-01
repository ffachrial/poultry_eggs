# Active Context

## Current Work Focus
The project has achieved its core milestones and advanced reporting capabilities. Recent work has focused on implementing the complete poultry management system with all core modules. The current focus is on preparing for user acceptance testing and finalizing mobile optimizations.

## Recent Changes
- **Updated Tech Stack**: Upgraded to Next.js 16.2.6, React 19, and Tailwind CSS 4.
- **Implemented Egg Quality System**: Form, server actions, and validation for tracking egg grades per cage.
- **Implemented Daily Cage Logs**: Support for tracking feed and mortality across multiple daily time slots (Pagi, Siang, Sore, Malam).
- **Implemented Sales Module**: Tracking revenue from egg sales with weight and pricing logic.
- **Implemented Finance Dashboard**: Expense tracking and financial health overview.
- **Implemented Reporting System**: Centralized reports page with data summaries and print support.
- **Enforced RBAC**: 
  - Admin users have full CRUD access.
  - Staff (USER role) have view-only access across all entry forms.
  - Role verification implemented in all Server Actions.
- **Added Visualization**: Integrated Recharts 3.8.1 to provide daily revenue charts on the dashboard and monthly trends in reports.
- **Added Data Export**: Implemented Excel (`.xlsx`) export functionality on the Reports page using the `xlsx` library.
- **File Structure Organization**: Organized all features into separate route directories (daily-logs, egg-quality, finance, sales, reports, etc.)
- **Component Library**: Created reusable components for forms, buttons, charts, and layout.

## Next Steps
- **User Acceptance Testing (UAT)**: Perform end-to-end testing with actual users or farm staff.
- **Mobile View Optimization**: Refine the responsive design for better field usage on mobile devices.
- **Batch Operations**: Explore faster data entry for multiple cages simultaneously.
- **Notifications System**: Implement alerts for low production or high mortality.
- **Performance Optimization**: Further optimize database queries and loading times.

## Active Decisions and Considerations
- **Form UX**: Used `useActionState` and `useFormStatus` (implied via `isPending`) for better feedback during data submission.
- **Data Freshness**: Used `revalidateTag` in Server Actions to ensure the Dashboard and Reports reflect the latest data immediately.
- **RBAC Implementation**: Forms are hidden for non-admins with a clear "View-Only" message to manage expectations.
- **Modular Organization**: Organized code by feature/domain for better maintainability.

## Important Patterns and Preferences
- **Zod Validation**: Centralized schema-based validation for all forms.
- **Server Actions**: Handling all database mutations securely with role checks.
- **Prisma Aggregations**: Using `_sum`, `_count`, and `_avg` for efficient reporting.
- **Modular File Structure**: Grouping related files by feature (e.g., app/daily-logs/, app/egg-quality/).

## Learnings and Project Insights
- Next.js 16 Server Actions further simplify the bridge between client forms and the database while maintaining security.
- RBAC is most effective when enforced at both the UI layer (for UX) and the logic layer (for security).
- Printing in web apps is best handled by CSS media queries (`@media print`) and hiding non-essential elements like sidebars.
- Modular organization by feature improves code maintainability and team collaboration.