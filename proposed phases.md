# 📌 VoIP Tariff System – Project Plan & Procedure

## 🧱 Phase 1: Requirements & Planning
- [x] Understand objectives from the boss ✔️
- [x] Choose tech stack: MERN (React + Express) with **MySQL**
- [x] Create GitHub repo ✔️
- [ ] Define project milestones and deliverables
- [ ] Prepare sample supplier CSV files (for testing)
- [ ] Confirm VoipSwitch-compatible export format

---

## 🗃️ Phase 2: Database Design (MySQL)
- [ ] Design relational schema for:
  - `suppliers`
  - `supplier_rates` (prefix, rate, currency, etc.)
  - `consolidated_rates` (lowest + optional backup per prefix)
- [ ] Generate SQL table creation scripts
- [ ] Load sample data via CSV import

---

## 🧠 Phase 3: Backend Development (Node.js + Express + MySQL)
- [ ] Set up Express server with MySQL connection (using `mysql2` or `sequelize`)
- [ ] API Routes:
  - POST `/upload-csv` – Upload supplier rate sheets
  - GET `/rates` – View all supplier rates
  - POST `/generate-tariff` – Create final consolidated tariff
  - GET `/export` – Export as VoipSwitch-ready CSV
- [ ] Implement CSV parsing and data insertion
- [ ] Tariff calculation logic:
  - Match longest prefix
  - Pick lowest rate
  - Select secondary backup route if needed

---

## 💻 Phase 4: Frontend Development (React + Vite + Tailwind)
- [ ] Setup Vite project and basic Tailwind theme
- [ ] Core UI Pages:
  - 📤 Supplier CSV Upload
  - 📊 View/Edit Imported Rates
  - 🔍 Tariff Generator (with optional filters)
  - 📁 Export Tariff CSV
- [ ] Add filtering, searching, sorting (by prefix, supplier, etc.)

---

## 📦 Phase 5: Export & Compatibility
- [ ] Format exported CSV to match VoipSwitch import spec
- [ ] Validate export file manually or through test environment

---

## 🧪 Phase 6: Testing & Validation
- [ ] Test:
  - Prefix matching logic
  - Rate selection accuracy
  - Export file validity
- [ ] Frontend usability review
- [ ] Handoff preparation checklist

---

## 🚀 Phase 7: Deployment & Handoff
- [ ] Optional: Deploy backend (e.g., Railway or local VM)
- [ ] Optional: Deploy frontend (e.g., Netlify, Vercel)
- [ ] Finalize code comments and documentation
- [ ] Include database SQL file and CSV format examples
- [ ] Add user guide for internal team

---

## 📌 Bonus / Future Features
- ⏱️ Schedule-based rate changes (future effective tariffs)
- 🔐 Role-based access (admin, editor)
- 🔄 Auto-sync supplier rates (via URL or email)
- 🧾 Reports and analytics (best/worst suppliers)

---

