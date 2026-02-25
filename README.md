<div align="center">

# Fresh Grocers

### A Multi-Role Grocery Delivery Marketplace

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=github&logoColor=white)

![No Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)
![No Build Step](https://img.shields.io/badge/build%20step-none-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Maintenance](https://img.shields.io/badge/maintained-yes-success?style=flat-square)

*Production-quality grocery delivery web application — built with zero dependencies, zero frameworks, zero build tools.*

[Live Demo](#setup--running) · [Features](#features) · [Algorithm](#proximity-assignment-algorithm) · [Demo Credentials](#demo-credentials)

</div>

---

## Overview

Fresh Grocers is a fully functional **multi-portal digital marketplace** simulating a real-world grocery delivery business in Sri Lanka. Three independent portals — Customer, Delivery Agent, and Admin — operate within a shared client-side data layer.

**Key highlights:**

- Multi-role SPA architecture with isolated portals and route guards
- LocalStorage used as a structured, relational client-side database
- Custom **proximity-based delivery assignment algorithm** with weighted scoring
- Responsive, accessible UI (WCAG 2.1) built without any CSS or JS frameworks

---

## Features

<details>
<summary><strong>Customer Portal</strong> — <code>customer.html</code></summary>

<br>

| Feature | Details |
|---------|---------|
| Product Catalogue | 53+ products across 8 categories (Fruits, Vegetables, Dairy, Bakery, Beverages, Snacks, Frozen, Household) |
| Filtering & Search | Filter by category, price range, and stock availability; sort by price, name, or popularity; debounced live search |
| Shopping Cart | Per-user cart with localStorage persistence |
| Checkout Flow | 3-step: Delivery Details → Payment → Review & Place Order |
| Delivery Slots | Morning / Afternoon / Evening time-slot selection |
| Payment Methods | Cash on Delivery or Online (card form with validation) |
| Order Tracking | Live order status with animated step-progress indicator |
| Ratings & Feedback | Post-delivery star rating and review submission |
| Profile Management | Update name, phone number, and delivery address |

</details>

<details>
<summary><strong>Delivery Agent Portal</strong> — <code>agent.html</code></summary>

<br>

| Feature | Details |
|---------|---------|
| Availability Toggle | Online / Offline status control |
| Dashboard | Today's active deliveries, completed count, and earnings summary |
| Delivery Workflow | Start Delivery → Mark Delivered (with signature capture) |
| Navigation | Google Maps deep-link to delivery address |
| Performance Tab | 7-day earnings bar chart, rating display, and recent feedback list |
| Location Update | Set current area and postal code |
| Mobile UI | Optimised layout with bottom navigation bar |

</details>

<details>
<summary><strong>Admin Dashboard</strong> — <code>admin.html</code></summary>

<br>

| Section | Features |
|---------|---------|
| Dashboard | Revenue metrics, recent orders table, low-stock alerts, 7-day revenue chart, order status breakdown |
| Orders | Searchable/filterable table, order detail modal, status badges, CSR Quick Order (phone orders) |
| Delivery Assignment ⭐ | Proximity-based algorithm panel — ranks available agents, shows distance/rating/workload per recommendation, one-click assign, Auto-Assign All batch processing |
| Products | Full CRUD with category filter, stock status badges, CSV export |
| Customers | Searchable table, customer profile + order history modal, suspend/activate |
| Agents | Agent cards with performance stats, add/edit/remove, status toggle |
| Analytics | 30-day revenue chart, top 10 products, category revenue, agent performance table, rating distribution, order funnel |

</details>

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 with Custom Properties |
| Logic | Vanilla JavaScript ES6+ (IIFEs, modules) |
| Persistence | Browser LocalStorage (JSON) |
| Fonts | Google Fonts — Poppins, Roboto |
| Icons | Unicode Emoji |
| Hosting | Any static file server · GitHub Pages |

> No npm, no bundler, no framework. Open a file — it runs.

---

## Project Structure

```
fresh-grocers/
│
├── index.html                   # Login & registration
├── customer.html                # Customer shopping portal
├── agent.html                   # Delivery agent portal
└── admin.html                   # Admin dashboard
│
├── css/
│   ├── main.css                 # Design system & global components
│   ├── customer.css             # Customer portal styles
│   ├── agent.css                # Agent portal styles
│   └── admin.css                # Admin dashboard styles
│
├── js/
│   ├── utils.js                 # Shared utilities (toast, modal, formatting, CSV export)
│   ├── database.js              # LocalStorage CRUD abstraction layer
│   ├── assignment-algorithm.js  # Proximity-based delivery assignment
│   ├── auth.js                  # Authentication & route guards
│   ├── customer.js              # Customer SPA logic
│   ├── agent.js                 # Agent portal logic
│   └── admin.js                 # Admin dashboard logic
│
└── data/
    └── sample-data.js           # Seed data — products, users, orders
```

---

## Setup & Running

No installation or build step required.

### Option 1 — Direct File Open

```
Double-click index.html
```

> Works for most features. Some browsers restrict localStorage on `file://` — use Option 2 if you encounter issues.

### Option 2 — Local Server (Recommended)

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .

# VS Code
# Install "Live Server" → right-click index.html → Open with Live Server
```

Then open `http://localhost:8080` in your browser.

### Option 3 — GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fresh-grocers.git
git push -u origin main
```

Enable GitHub Pages: **Settings → Pages → Branch: `main`, Folder: `/ (root)`**

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | `demo.customer@freshgrocers.lk` | `customer123` |
| Agent | `demo.agent@freshgrocers.lk` | `agent123` |
| Admin | `admin@freshgrocers.lk` | `admin123` |

Additional seeded accounts are available in `data/sample-data.js`.

---

## Proximity Assignment Algorithm

The delivery assignment engine lives in `js/assignment-algorithm.js`. It scores every available online agent against a pending order and surfaces the best match.

**Scoring formula:**

```
score = (distance_km × 0.6) + (current_workload × 5) − (agent_rating × 2)
```

**Lower score = better match.**

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Distance (km) | `× 0.6` | Prefer closer agents; sourced from a 60+ entry Sri Lankan area distance matrix |
| Current Workload | `× 5` | Heavy penalty for already-loaded agents to distribute work fairly |
| Agent Rating | `× −2` | Higher-rated agents receive a score bonus |

- Only agents with `availabilityStatus: 'Online'` are considered.
- Unknown area pairs default to **60 km**.
- The Admin panel exposes the full scoring breakdown per agent so operators understand every recommendation.

---

## Data Model

| LocalStorage Key | Description |
|-----------------|-------------|
| `fg_customers` | Customer accounts |
| `fg_deliveryAgents` | Delivery agent accounts |
| `fg_administrators` | Admin & CSR accounts |
| `fg_products` | Product catalogue |
| `fg_orders` | Customer orders |
| `fg_deliveries` | Delivery records |
| `fg_feedback` | Customer ratings & reviews |
| `fg_payments` | Payment records |
| `fg_initialized` | Seed-once guard flag |
| `fg_session` | Active session (sessionStorage) |
| `fg_remember` | Remember-me token |
| `fg_cart_<userID>` | Per-user shopping cart |

**Reset all data:** open the browser console and run `DB.reset()`.

---

## Known Limitations

| Limitation | Detail |
|------------|--------|
| No backend | All data lives in the browser's localStorage and is lost when browser data is cleared |
| Password storage | `btoa()` (Base64) is used for demo purposes — not cryptographically secure |
| Notifications | SMS and email are simulated via toast messages and `console.log` |
| Device sync | Data does not sync across devices or browsers |
| Distance matrix | Covers major Sri Lankan areas; unmapped pairs default to 60 km |

---

## Testing Checklist

- [ ] Register a new customer account
- [ ] Browse products, filter by category, use live search
- [ ] Add items to cart, adjust quantities, remove items
- [ ] Complete checkout — COD and online payment paths
- [ ] View order status and the tracking step indicator
- [ ] Submit post-delivery rating and feedback
- [ ] Log in as Agent → go Online → start and complete a delivery
- [ ] Log in as Admin → review dashboard metrics
- [ ] Manually assign an order via the Assignment panel
- [ ] Use **Auto-Assign All** for batch processing
- [ ] Add, edit, and delete a product
- [ ] Suspend and re-activate a customer account
- [ ] Place a CSR Quick Order by phone
- [ ] Export CSV from Products and Analytics pages

---

## Academic Context

Built as the implementation component of a **Higher Nationals System Analysis & Design** assignment, demonstrating:

- Requirements gathering → system design → implementation → testing pipeline
- Use-case modelling (Customer, Agent, Admin actors)
- Entity-Relationship design mapped to LocalStorage collections
- Algorithm design and complexity analysis (proximity scoring)
- UI/UX design principles — WCAG 2.1 accessibility, mobile-first responsive layout

---

<div align="center">

Made with HTML, CSS, and JavaScript — no shortcuts.

</div>
