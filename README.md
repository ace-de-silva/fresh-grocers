# Fresh Grocers Digital Marketplace

A production-quality, portfolio-grade grocery delivery web application built with **pure HTML5, CSS3, and Vanilla JavaScript** — no frameworks, no bundlers, no backend.

---

## Overview

Fresh Grocers is a fully functional multi-portal digital marketplace simulating a real-world grocery delivery business in Sri Lanka. It demonstrates:

- Multi-role SPA architecture (Customer, Agent, Admin)
- LocalStorage as a client-side relational database
- A custom **proximity-based delivery assignment algorithm**
- Responsive, accessible UI built without any CSS/JS frameworks

---

## Features

### Customer Portal (`customer.html`)
- Browse 53+ products across 8 categories (Fruits, Vegetables, Dairy, Bakery, Beverages, Snacks, Frozen, Household)
- Filter by category, price range, stock availability; sort by price/name/popularity
- Product search with debounced live results
- Shopping cart with per-user localStorage persistence
- 3-step checkout: Delivery Details → Payment → Review & Place Order
- Delivery time-slot selection (Morning / Afternoon / Evening)
- Payment methods: Cash on Delivery or Online (card form)
- Order history with live status tracking and step-progress indicator
- Post-delivery star rating & feedback submission
- User profile management (name, phone, address)

### Delivery Agent Portal (`agent.html`)
- Online / Offline availability toggle
- Dashboard with today's active deliveries, completed count, earnings
- Delivery management: Start Delivery → Mark Delivered (with signature capture)
- Google Maps deep-link for navigation to delivery address
- Performance tab: 7-day bar chart, rating display, recent feedback list
- Location update (current area/postal code)
- Mobile-optimised with bottom navigation bar

### Admin Dashboard (`admin.html`)
- **Dashboard**: Revenue metrics, recent orders table, low-stock alerts, 7-day revenue chart, order status breakdown
- **Orders**: Searchable/filterable table, order detail modal, status badges, CSR Quick Order (phone orders)
- **Delivery Assignment** ⭐ — Proximity-based algorithm panel:
  - Lists all unassigned orders
  - Ranks available agents by score: `(distance × 0.6) + (workload × 5) − (rating × 2)`
  - Shows distance, rating, and active workload per recommendation
  - One-click assign with SMS simulation
  - **Auto-Assign All** button for batch processing
- **Products**: Full CRUD with category filter, stock status badges, CSV export
- **Customers**: Searchable table, customer profile + order history modal, suspend/activate
- **Agents**: Agent cards with performance stats, add/edit/remove, status toggle
- **Analytics**: 30-day revenue chart, top 10 products, category revenue, agent performance table, rating distribution, order funnel

---

## Technology Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| UI          | HTML5, CSS3 Custom Properties     |
| Logic       | Vanilla JavaScript ES6+ (IIFEs)  |
| Data        | LocalStorage (JSON)               |
| Fonts       | Google Fonts (Poppins, Roboto)    |
| Icons       | Unicode Emoji                     |
| Hosting     | Any static file server / GitHub Pages |

---

## File Structure

```
fresh-grocers/
├── index.html              # Login & registration page
├── customer.html           # Customer shopping portal
├── agent.html              # Delivery agent portal
├── admin.html              # Admin dashboard
│
├── css/
│   ├── main.css            # Design system, global components
│   ├── customer.css        # Customer portal styles
│   ├── agent.css           # Agent portal styles
│   └── admin.css           # Admin dashboard styles
│
├── js/
│   ├── utils.js            # Shared utilities (toast, modal, format, export)
│   ├── database.js         # LocalStorage CRUD layer
│   ├── assignment-algorithm.js  # Proximity delivery assignment
│   ├── auth.js             # Authentication & route guards
│   ├── customer.js         # Customer SPA logic
│   ├── agent.js            # Agent portal logic
│   └── admin.js            # Admin dashboard logic
│
└── data/
    └── sample-data.js      # Seed data (products, users, orders)
```

---

## Setup & Running

No build step required. Simply open the files in a browser:

### Option 1 — Direct file open
```
Double-click index.html
```
> Works for most features. Some browsers may block localStorage on `file://` — use Option 2 if you encounter issues.

### Option 2 — Local server (recommended)
```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code
Install "Live Server" extension → right-click index.html → Open with Live Server
```
Then visit: `http://localhost:8080`

### Option 3 — GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fresh-grocers.git
git push -u origin main
```
Enable GitHub Pages in repository Settings → Pages → Branch: `main`, folder: `/ (root)`.

---

## Demo Credentials

| Role     | Email                           | Password    |
|----------|---------------------------------|-------------|
| Customer | demo.customer@freshgrocers.lk   | customer123 |
| Agent    | demo.agent@freshgrocers.lk      | agent123    |
| Admin    | admin@freshgrocers.lk           | admin123    |

Additional accounts are seeded in `data/sample-data.js`.

---

## Proximity Assignment Algorithm

The star feature of the system. Located in `js/assignment-algorithm.js`.

**Scoring formula:**
```
score = (distance_km × 0.6) + (current_workload × 5) − (agent_rating × 2)
```

Lower score = better match.

**Factors considered:**
- **Distance** (0.6 weight): Lookup in a 60+ entry Sri Lankan area distance matrix. Default 60 km for unknown pairs.
- **Workload** (5 weight): Number of active deliveries currently assigned. Heavy penalty for overloaded agents.
- **Rating** (−2 weight): Higher-rated agents get a score bonus (negative contribution).

**Only online agents** (`availabilityStatus: 'Online'`) are considered for assignment.

The Admin panel shows the full reasoning per recommendation so the operator can understand why each agent was ranked.

---

## Data Model (LocalStorage Keys)

| Key                   | Description                        |
|-----------------------|------------------------------------|
| `fg_customers`        | Customer accounts                  |
| `fg_deliveryAgents`   | Delivery agent accounts            |
| `fg_administrators`   | Admin/CSR accounts                 |
| `fg_products`         | Product catalogue                  |
| `fg_orders`           | Customer orders                    |
| `fg_deliveries`       | Delivery records                   |
| `fg_feedback`         | Customer ratings & reviews         |
| `fg_payments`         | Payment records                    |
| `fg_initialized`      | Seed-once guard flag               |
| `fg_session`          | Active session (sessionStorage)    |
| `fg_remember`         | Remember-me token (localStorage)   |
| `fg_cart_<userID>`    | Per-user shopping cart             |

To reset all data: open browser console and run `DB.reset()`.

---

## Known Limitations

- **No real backend** — all data lives in the browser's localStorage and is cleared if the user clears browser data.
- **Password hashing** — `btoa()` (Base64) is used for demo purposes only. Not cryptographically secure.
- **No real SMS/email** — notifications are simulated via `console.log` and toast messages.
- **Single-device only** — data does not sync across devices or browsers.
- **Distance matrix** — covers major Sri Lankan areas; unmapped pairs default to 60 km.

---

## Testing Checklist

- [ ] Register a new customer account
- [ ] Browse products, filter by category, search
- [ ] Add items to cart, adjust quantities, remove items
- [ ] Complete checkout (COD and Online payment)
- [ ] View order status and tracking stepper
- [ ] Submit delivery feedback / rating
- [ ] Log in as Agent, go Online, accept and complete a delivery
- [ ] Log in as Admin, view dashboard metrics
- [ ] Assign an order manually via the Assignment panel
- [ ] Use Auto-Assign All
- [ ] Add / edit / delete a product
- [ ] Suspend and re-activate a customer
- [ ] Place a CSR Quick Order by phone
- [ ] Export CSV from Products and Analytics pages

---

## Academic Context

Built as the implementation component of a Higher Nationals System Analysis & Design assignment, demonstrating:

- Requirements gathering → system design → implementation → testing
- Use-case modelling (Customer, Agent, Admin actors)
- Entity-Relationship design mapped to LocalStorage collections
- Algorithm design and complexity analysis (proximity scoring)
- UI/UX design principles (WCAG 2.1 accessibility, mobile-first responsive)
