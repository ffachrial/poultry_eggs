# Project Brief: Poultry Management System (Ayam Petelur)

## 1. Project Overview
A web-based management system for a poultry farm specializing in laying hens. The system tracks egg quality, daily operational logs, sales, and financial performance. It features role-based access control, data visualization dashboards, and printable reports.

## 2. Core Requirements & Features

### 2.1. Egg Quality Checklist (Per Cage)
- **Structure:** Form-based checklist per individual cage.
- **Stocking Rate:** 1 cage = 2 chickens.
- **Quality Grading (Mandatory):**
    - `S` (Sempurna): Perfect condition.
    - `R` (Retak): Cracked but safe for consumption.
    - `P` (Pecah): Broken, not for consumption.
- **Calculation:** System must auto-calculate total "good eggs" (S+R) aggregated per month, per cage.

### 2.2. Daily Cage Logs
- **Check Schedule:** Four daily entries: Pagi (Morning), Siang (Noon), Sore (Evening), Malam (Night).
- **Daily Data Per Cage:**
    - Mortality count (Mati).
    - Feed restock status / quantity (Resupply Pakan).

### 2.3. Sales Form (Telur Ayam)
- **Data Fields:**
    - Tanggal (Date)
    - Nama Pembeli (Buyer Name)
    - Jumlah Kg (Kilogram Quantity)
    - Harga Satuan (Unit Price)
    - Total (Auto-calculated)
    - Keterangan (Notes)

### 2.4. Financial Logic
- **Formula:** `Pengeluaran - Penjualan = Hasil Penjualan` (Expenses - Sales = Net Sales Result).

## 3. Dashboard & Analytics (Charts)
- **Chart 1:** Daily egg revenue (Grafik pendapatan telur per hari).
- **Chart 2:** Monthly & Yearly egg revenue (Grafik pendapatan telur per bulan per tahun).

## 4. Reporting & Export
- **Print Function:** All forms and dashboards must be "printable" for physical reporting (Laporan).

## 5. Security & Access Control (RBAC)
- **Multiple Login:** Support for multiple user accounts.
- **Admin Role:**
    - Full CRUD (Create, Read, Update, Delete) access to all data.
    - **Only admin can modify** system data.
- **User Role:**
    - **View Only.** Read-only access to forms and reports. No edit/delete permissions.

## 6. Technical Stack (Strict)
- **Framework:** Next.js 16 (App Router).
- **Database:** Neon DB (Serverless Postgres).
- **Styling:** Tailwind CSS.
- **Language:** TypeScript (Strict mode).

## 7. UI/UX & Design Guidelines
- **Mobile-First Paradigm:** Design all layouts, interactions, and content flows for mobile viewports ($375 \text{px}$ – $480 \text{px}$ width) first. Implement tablet and desktop (larger than $768 \text{px}$) scaling only via CSS media queries.
- **Content Hierarchy:** Prioritize the most crucial user task on every screen. Hide secondary actions behind a hamburger menu, bottom-sheet, or overflow modal to avoid screen clutter.
- **Touch-Friendly Controls:** All clickable elements (buttons, links, form inputs) must have a minimum size of $48 \text{px} \times 48 \text{px}$ and adequate spacing to prevent mis-taps.
- **Responsive Layouts:** Use modern, flexible CSS (Flexbox or CSS Grid) rather than fixed pixel widths. Ensure text scaling (`rem`) is used over absolute font sizes.
- **Visual Style:** Utilize mobile-first design patterns such as bottom navigation bars, floating action buttons (FABs), and swipe-to-dismiss gestures where appropriate.
