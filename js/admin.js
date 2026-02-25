/* =====================================================================
   admin.js — Fresh Grocers Admin Dashboard SPA
   Requires: utils.js, database.js, assignment-algorithm.js, auth.js
   ===================================================================== */

window.AdminApp = (function () {
  'use strict';

  /* ── State ────────────────────────────────────────────────────────── */
  let _currentAdmin = null;
  let _currentView  = 'dashboard';
  let _clockInterval = null;

  // Pending confirmation callbacks
  let _pendingDelete    = null;
  let _pendingAssign    = null;

  // Filters / pagination state
  const _state = {
    orders:    { search: '', status: 'all', page: 1, perPage: 15 },
    customers: { search: '', status: 'all', page: 1, perPage: 15 },
    agents:    { search: '', page: 1, perPage: 15 },
    products:  { search: '', category: 'all', page: 1, perPage: 20 },
  };

  /* ── Init ─────────────────────────────────────────────────────────── */
  function init() {
    Auth.requireAdmin();
    _currentAdmin = Auth.getCurrentUser();
    _populateAdminInfo();
    _startClock();
    _updateSidebarBadges();

    // Hash-based routing
    const hash = location.hash.replace('#', '') || 'dashboard';
    navigate(hash);
    window.addEventListener('hashchange', () => {
      const view = location.hash.replace('#', '') || 'dashboard';
      navigate(view, true);
    });
  }

  function _populateAdminInfo() {
    const name = _currentAdmin ? _currentAdmin.name : 'Admin';
    const role = _currentAdmin ? (_currentAdmin.role || 'Admin') : 'Admin';
    const initial = name.charAt(0).toUpperCase();

    _setText('sidebar-admin-name', name);
    _setText('sidebar-admin-role', role);
    _setText('topbar-admin-name', name);
    _setAttr('topbar-avatar', 'textContent', initial);
    _setAttr('sidebar-user', 'querySelector', null); // noop
    const avatarEl = document.querySelector('#sidebar-user .avatar');
    if (avatarEl) avatarEl.textContent = initial;
    const topAvatar = document.getElementById('topbar-avatar');
    if (topAvatar) topAvatar.textContent = initial;
  }

  function _startClock() {
    function tick() {
      const el = document.getElementById('topbar-time');
      if (el) el.textContent = new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });
    }
    tick();
    _clockInterval = setInterval(tick, 30000);
  }

  function _updateSidebarBadges() {
    const orders   = DB.orders.getAll();
    const pending  = orders.filter(o => o.deliveryStatus === 'Received').length;
    const unassigned = orders.filter(o => o.deliveryStatus === 'Received' && !o.assignedAgentID).length;

    const ordBadge = document.getElementById('sidebar-badge-orders');
    if (ordBadge) { ordBadge.textContent = pending > 0 ? pending : ''; }

    const asgBadge = document.getElementById('sidebar-badge-assign');
    if (asgBadge) { asgBadge.textContent = unassigned > 0 ? unassigned : ''; }

    const notif = document.getElementById('topbar-notif');
    if (notif) { notif.textContent = unassigned > 0 ? unassigned : ''; notif.style.display = unassigned > 0 ? '' : 'none'; }
  }

  /* ── Routing ──────────────────────────────────────────────────────── */
  const VIEW_LABELS = {
    dashboard:  'Dashboard',
    orders:     'Orders',
    assignment: 'Delivery Assignment',
    products:   'Products',
    customers:  'Customers',
    agents:     'Delivery Agents',
    analytics:  'Analytics',
  };

  function navigate(view, fromHash) {
    if (!VIEW_LABELS[view]) view = 'dashboard';
    _currentView = view;
    if (!fromHash) location.hash = view;

    // Sidebar active state
    document.querySelectorAll('.admin-sidebar__item').forEach(btn => btn.classList.remove('admin-sidebar__item--active'));
    const active = document.getElementById('nav-' + view);
    if (active) active.classList.add('admin-sidebar__item--active');

    // Breadcrumb
    _setText('topbar-breadcrumb', VIEW_LABELS[view] || view);

    // Render
    const renderMap = {
      dashboard:  renderDashboard,
      orders:     renderOrders,
      assignment: renderAssignment,
      products:   renderProducts,
      customers:  renderCustomers,
      agents:     renderAgents,
      analytics:  renderAnalytics,
    };

    const fn = renderMap[view];
    if (fn) fn();

    closeSidebar();
  }

  /* ── Sidebar (mobile) ─────────────────────────────────────────────── */
  function openSidebar() {
    document.getElementById('admin-sidebar').classList.add('admin-sidebar--open');
    document.getElementById('sidebar-overlay').classList.add('admin-sidebar-overlay--visible');
  }

  function closeSidebar() {
    document.getElementById('admin-sidebar').classList.remove('admin-sidebar--open');
    document.getElementById('sidebar-overlay').classList.remove('admin-sidebar-overlay--visible');
  }

  /* ── Helpers ──────────────────────────────────────────────────────── */
  function _content(html) {
    document.getElementById('admin-content').innerHTML = html;
  }

  function _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function _setAttr(id, attr, val) {
    const el = document.getElementById(id);
    if (el) el[attr] = val;
  }

  /** Returns pagination HTML string for use inside template literals. */
  function _paginationHtml(paginated, onClickFn) {
    const { page, totalPages } = paginated;
    if (totalPages <= 1) return '';
    let html = '<nav class="pagination" aria-label="Pagination" style="padding:1rem;"><ul class="pagination__list">';
    html += `<li><button class="pagination__btn" ${page === 1 ? 'disabled' : ''} onclick="${onClickFn(page - 1)}" aria-label="Previous">‹</button></li>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<li><button class="pagination__btn ${i === page ? 'pagination__btn--active' : ''}" onclick="${onClickFn(i)}" aria-current="${i === page ? 'page' : 'false'}">${i}</button></li>`;
    }
    html += `<li><button class="pagination__btn" ${page === totalPages ? 'disabled' : ''} onclick="${onClickFn(page + 1)}" aria-label="Next">›</button></li>`;
    html += '</ul></nav>';
    return html;
  }

  /** Show form error — accepts element ID string or DOM element. */
  function _formError(idOrEl, msg) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    Utils.showFormError(el, msg);
  }

  /** Clear form error — accepts element ID string or DOM element. */
  function _clearError(idOrEl) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    Utils.clearFormError(el);
  }

  function _statusBadge(status) {
    const map = {
      'Received':         'badge--info',
      'Processing':       'badge--warning',
      'Out for Delivery': 'badge--primary',
      'Delivered':        'badge--success',
      'Cancelled':        'badge--danger',
    };
    return `<span class="badge ${map[status] || 'badge--info'}">${status}</span>`;
  }

  /* ═══════════════════════════════════════════════════════════════════
     1. DASHBOARD
  ═══════════════════════════════════════════════════════════════════ */
  function renderDashboard() {
    const orders    = DB.orders.getAll();
    const customers = DB.customers.getAll();
    const agents    = DB.agents.getAll();
    const products  = DB.products.getAll();

    const totalRevenue   = orders.filter(o => o.deliveryStatus === 'Delivered').reduce((s, o) => s + o.totalAmount, 0);
    const todayOrders    = orders.filter(o => _isToday(o.orderDate)).length;
    const onlineAgents   = agents.filter(a => a.availabilityStatus === 'Online').length;
    const lowStock       = products.filter(p => p.stockQuantity < 10);
    const pendingOrders  = orders.filter(o => o.deliveryStatus === 'Received' || o.deliveryStatus === 'Processing');
    const recentOrders   = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 8);
    const unassigned     = orders.filter(o => o.deliveryStatus === 'Received' && !o.assignedAgentID).length;

    // Revenue last 7 days for mini chart
    const revenueByDay = _getRevenueLast7Days(orders);

    _content(`
      <div class="admin-page">
        <!-- Metrics -->
        <div class="admin-metrics">
          <div class="metric-card">
            <div class="metric-card__icon metric-card__icon--green">💰</div>
            <div class="metric-card__body">
              <div class="metric-card__value">${Utils.formatCurrency(totalRevenue)}</div>
              <div class="metric-card__label">Total Revenue</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-card__icon metric-card__icon--blue">📦</div>
            <div class="metric-card__body">
              <div class="metric-card__value">${orders.length}</div>
              <div class="metric-card__label">Total Orders <small style="color:var(--success);">(+${todayOrders} today)</small></div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-card__icon metric-card__icon--purple">👥</div>
            <div class="metric-card__body">
              <div class="metric-card__value">${customers.length}</div>
              <div class="metric-card__label">Customers</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-card__icon metric-card__icon--orange">🛵</div>
            <div class="metric-card__body">
              <div class="metric-card__value">${onlineAgents}/${agents.length}</div>
              <div class="metric-card__label">Agents Online</div>
            </div>
          </div>
        </div>

        ${unassigned > 0 ? `
        <div class="alert alert--warning" style="margin-bottom:1.5rem;">
          ⚠️ <strong>${unassigned} order${unassigned > 1 ? 's' : ''}</strong> awaiting delivery assignment.
          <button class="btn btn--warning btn--sm" style="margin-left:1rem;" onclick="AdminApp.navigate('assignment')">Assign Now</button>
        </div>` : ''}

        <div class="admin-dashboard-grid">
          <!-- Recent Orders -->
          <div class="admin-card">
            <div class="admin-card__header">
              <div class="admin-card__title">Recent Orders</div>
              <button class="btn btn--ghost btn--sm" onclick="AdminApp.navigate('orders')">View All →</button>
            </div>
            <div class="table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${recentOrders.map(o => {
                    const cust = DB.customers.getById(o.customerID);
                    return `<tr>
                      <td><code>${o.orderID}</code></td>
                      <td>${cust ? cust.name : '—'}</td>
                      <td>${Utils.formatCurrency(o.totalAmount)}</td>
                      <td>${_statusBadge(o.deliveryStatus)}</td>
                      <td>${Utils.formatDate(o.orderDate)}</td>
                      <td><button class="btn btn--ghost btn--xs" onclick="AdminApp.viewOrder('${o.orderID}')">View</button></td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right Column -->
          <div style="display:flex;flex-direction:column;gap:1.5rem;">

            <!-- Revenue 7-day chart -->
            <div class="admin-card">
              <div class="admin-card__header">
                <div class="admin-card__title">Revenue — Last 7 Days</div>
              </div>
              <div class="bar-chart-wrap" style="padding:0.5rem 0;">
                ${_renderBarChart(revenueByDay)}
              </div>
            </div>

            <!-- Low Stock Alerts -->
            <div class="admin-card">
              <div class="admin-card__header">
                <div class="admin-card__title">⚠️ Low Stock Alert</div>
                <button class="btn btn--ghost btn--sm" onclick="AdminApp.navigate('products')">Manage →</button>
              </div>
              ${lowStock.length === 0
                ? '<div class="empty-state empty-state--sm"><div class="empty-state__icon">✅</div><div class="empty-state__text">All stock levels healthy</div></div>'
                : `<div class="table-wrap"><table class="admin-table">
                    <thead><tr><th>Product</th><th>Category</th><th>Stock</th></tr></thead>
                    <tbody>
                      ${lowStock.slice(0, 6).map(p => `<tr>
                        <td>${p.emoji || ''} ${p.name}</td>
                        <td>${p.category}</td>
                        <td><span class="badge ${p.stockQuantity === 0 ? 'badge--danger' : 'badge--warning'}">${p.stockQuantity}</span></td>
                      </tr>`).join('')}
                    </tbody>
                  </table></div>`
              }
            </div>

            <!-- Order Status Summary -->
            <div class="admin-card">
              <div class="admin-card__header">
                <div class="admin-card__title">Order Status Breakdown</div>
              </div>
              ${_renderStatusBreakdown(orders)}
            </div>
          </div>
        </div>
      </div>
    `);
  }

  function _isToday(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  function _getRevenueLast7Days(orders) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-LK', { weekday: 'short' });
      const dateStr = d.toISOString().slice(0, 10);
      const rev = orders
        .filter(o => o.deliveryStatus === 'Delivered' && o.orderDate && o.orderDate.startsWith(dateStr))
        .reduce((s, o) => s + o.totalAmount, 0);
      days.push({ label, value: rev });
    }
    return days;
  }

  function _renderBarChart(data) {
    const max = Math.max(...data.map(d => d.value), 1);
    return `<div class="bar-chart">
      ${data.map(d => `
        <div class="bar-chart__item">
          <div class="bar-chart__bar-wrap">
            <div class="bar-chart__bar" style="height:${Math.round((d.value / max) * 80)}px;" title="${Utils.formatCurrency(d.value)}"></div>
          </div>
          <div class="bar-chart__label">${d.label}</div>
          <div class="bar-chart__value" style="font-size:.65rem;color:var(--gray-500);">${d.value > 0 ? Utils.formatCurrency(d.value) : ''}</div>
        </div>
      `).join('')}
    </div>`;
  }

  function _renderStatusBreakdown(orders) {
    const statuses = ['Received', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    const total = orders.length || 1;
    return `<div style="display:flex;flex-direction:column;gap:0.5rem;padding:0.25rem 0;">
      ${statuses.map(s => {
        const count = orders.filter(o => o.deliveryStatus === s).length;
        const pct   = Math.round((count / total) * 100);
        return `<div>
          <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:2px;">
            <span>${_statusBadge(s)}</span><span style="color:var(--gray-600);">${count} (${pct}%)</span>
          </div>
          <div class="progress" style="height:6px;"><div class="progress__bar" style="width:${pct}%;"></div></div>
        </div>`;
      }).join('')}
    </div>`;
  }

  /* ═══════════════════════════════════════════════════════════════════
     2. ORDERS
  ═══════════════════════════════════════════════════════════════════ */
  function renderOrders() {
    const s = _state.orders;
    let orders = DB.orders.getAll();

    // Filter
    if (s.search) {
      const q = s.search.toLowerCase();
      orders = orders.filter(o => o.orderID.toLowerCase().includes(q) || (DB.customers.getById(o.customerID) || {}).name?.toLowerCase().includes(q));
    }
    if (s.status !== 'all') orders = orders.filter(o => o.deliveryStatus === s.status);
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    const paginated = Utils.paginateArray(orders, s.page, s.perPage);

    _content(`
      <div class="admin-page">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Orders</h1>
            <p class="admin-page-subtitle">${orders.length} order${orders.length !== 1 ? 's' : ''} total</p>
          </div>
          <button class="btn btn--success btn--sm" onclick="AdminApp.openQuickOrder()">📞 CSR Quick Order</button>
        </div>

        <!-- Toolbar -->
        <div class="admin-toolbar">
          <div class="admin-toolbar__search">
            <input class="form__input form__input--sm" type="search" placeholder="Search by order ID or customer…"
              value="${s.search}" oninput="AdminApp.setOrderFilter('search', this.value)" id="orders-search">
          </div>
          <div class="admin-toolbar__filters">
            ${['all','Received','Processing','Out for Delivery','Delivered','Cancelled'].map(st =>
              `<button class="btn btn--xs ${s.status === st ? 'btn--primary' : 'btn--outline-gray'}"
                onclick="AdminApp.setOrderFilter('status', '${st}')">${st === 'all' ? 'All' : st}</button>`
            ).join('')}
          </div>
        </div>

        <!-- Table -->
        <div class="admin-card">
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Agent</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${paginated.items.length === 0
                  ? `<tr><td colspan="9"><div class="empty-state empty-state--sm"><div class="empty-state__icon">📦</div><div class="empty-state__text">No orders found</div></div></td></tr>`
                  : paginated.items.map(o => {
                    const cust  = DB.customers.getById(o.customerID);
                    const agent = o.assignedAgentID ? DB.agents.getById(o.assignedAgentID) : null;
                    return `<tr>
                      <td><code>${o.orderID}</code></td>
                      <td>${cust ? cust.name : '—'}</td>
                      <td>${(o.items || []).length} item${(o.items || []).length !== 1 ? 's' : ''}</td>
                      <td>${Utils.formatCurrency(o.totalAmount)}</td>
                      <td><span class="badge badge--info">${o.paymentMethod || 'COD'}</span></td>
                      <td>${_statusBadge(o.deliveryStatus)}</td>
                      <td>${agent ? agent.name : '<span style="color:var(--gray-400);">Unassigned</span>'}</td>
                      <td>${Utils.formatDate(o.orderDate)}</td>
                      <td>
                        <button class="btn btn--ghost btn--xs" onclick="AdminApp.viewOrder('${o.orderID}')">View</button>
                        ${o.deliveryStatus === 'Received' ? `<button class="btn btn--primary btn--xs" onclick="AdminApp.navigate('assignment')">Assign</button>` : ''}
                      </td>
                    </tr>`;
                  }).join('')}
              </tbody>
            </table>
          </div>
          ${_paginationHtml(paginated, (p) => `AdminApp.setOrderPage(${p})`)}
        </div>
      </div>
    `);
  }

  function setOrderFilter(key, value) {
    _state.orders[key] = value;
    _state.orders.page = 1;
    renderOrders();
    if (key === 'search') {
      const el = document.getElementById('orders-search');
      if (el) { el.focus(); el.setSelectionRange(value.length, value.length); }
    }
  }

  function setOrderPage(p) {
    _state.orders.page = p;
    renderOrders();
    document.getElementById('admin-content').scrollTop = 0;
  }

  function viewOrder(orderId) {
    const order = DB.orders.getById(orderId);
    if (!order) return;
    const cust  = DB.customers.getById(order.customerID) || {};
    const agent = order.assignedAgentID ? (DB.agents.getById(order.assignedAgentID) || {}) : null;
    const delivery = DB.deliveries.getAll().find(d => d.orderID === orderId);

    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td>${item.emoji || ''} ${item.name}</td>
        <td>${item.quantity}</td>
        <td>${Utils.formatCurrency(item.price)}</td>
        <td>${Utils.formatCurrency(item.price * item.quantity)}</td>
      </tr>`).join('');

    document.getElementById('modal-order-detail-body').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">
        <div>
          <h3 style="font-size:.9rem;color:var(--gray-500);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em;">Order Info</h3>
          <table class="detail-table">
            <tr><td>Order ID</td><td><code>${order.orderID}</code></td></tr>
            <tr><td>Status</td><td>${_statusBadge(order.deliveryStatus)}</td></tr>
            <tr><td>Date</td><td>${Utils.formatDateTime(order.orderDate)}</td></tr>
            <tr><td>Payment</td><td>${order.paymentMethod || 'COD'} — <span class="${order.paymentStatus === 'Paid' ? 'badge badge--success' : 'badge badge--warning'}">${order.paymentStatus || 'Pending'}</span></td></tr>
            <tr><td>Time Slot</td><td>${order.deliverySlot || '—'}</td></tr>
          </table>
        </div>
        <div>
          <h3 style="font-size:.9rem;color:var(--gray-500);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em;">Customer</h3>
          <table class="detail-table">
            <tr><td>Name</td><td>${cust.name || '—'}</td></tr>
            <tr><td>Phone</td><td>${cust.phone || '—'}</td></tr>
            <tr><td>Email</td><td>${cust.email || '—'}</td></tr>
            <tr><td>Address</td><td>${order.deliveryAddress || cust.address || '—'}</td></tr>
            <tr><td>Area</td><td>${order.deliveryArea || cust.area || '—'}</td></tr>
          </table>
        </div>
      </div>

      ${agent ? `
      <div style="margin-top:1rem;">
        <h3 style="font-size:.9rem;color:var(--gray-500);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em;">Assigned Agent</h3>
        <table class="detail-table">
          <tr><td>Name</td><td>${agent.name}</td></tr>
          <tr><td>Phone</td><td>${agent.phone || '—'}</td></tr>
          <tr><td>Vehicle</td><td>${agent.vehicleNumber || '—'}</td></tr>
          <tr><td>Area</td><td>${agent.currentLocation || agent.area || '—'}</td></tr>
          ${delivery ? `<tr><td>Delivery Status</td><td>${_statusBadge(delivery.deliveryStatus)}</td></tr>` : ''}
          ${delivery && delivery.estimatedArrival ? `<tr><td>ETA</td><td>${delivery.estimatedArrival}</td></tr>` : ''}
        </table>
      </div>` : ''}

      <div style="margin-top:1rem;">
        <h3 style="font-size:.9rem;color:var(--gray-500);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em;">Order Items</h3>
        <table class="admin-table">
          <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr><td colspan="3" style="text-align:right;color:var(--gray-600);">Subtotal</td><td>${Utils.formatCurrency(order.subtotal || 0)}</td></tr>
            <tr><td colspan="3" style="text-align:right;color:var(--gray-600);">Delivery Fee</td><td>${Utils.formatCurrency(order.deliveryFee || 0)}</td></tr>
            <tr><td colspan="3" style="text-align:right;color:var(--gray-600);">Tax (5%)</td><td>${Utils.formatCurrency(order.tax || 0)}</td></tr>
            <tr style="font-weight:700;"><td colspan="3" style="text-align:right;">Total</td><td>${Utils.formatCurrency(order.totalAmount)}</td></tr>
          </tfoot>
        </table>
      </div>

      ${order.deliveryStatus === 'Received' ? `
      <div style="margin-top:1rem;padding:1rem;background:var(--warning-light,#fffbeb);border-radius:var(--radius-md);border:1px solid var(--warning);">
        <strong>⚠️ Awaiting Assignment</strong> — This order has not been assigned to a delivery agent yet.
        <button class="btn btn--warning btn--sm" style="margin-left:1rem;" onclick="Utils.hideModal('modal-order-detail'); AdminApp.navigate('assignment');">Assign Agent</button>
      </div>` : ''}
    `;

    document.getElementById('modal-order-detail-title').textContent = `Order ${orderId}`;
    Utils.showModal('modal-order-detail');
  }

  /* ── CSR Quick Order ───────────────────────────────────────────── */
  function openQuickOrder() {
    const customers  = DB.customers.getAll();
    const categories = [...new Set(DB.products.getAll().map(p => p.category))];

    document.getElementById('modal-qo-body').innerHTML = `
      <div class="csr-order">
        <div class="form__row">
          <div class="form__group">
            <label class="form__label" for="qo-customer">Customer <span class="form__required">*</span></label>
            <select class="form__select" id="qo-customer" onchange="AdminApp.qoLoadCustomer()">
              <option value="">Select customer…</option>
              ${customers.map(c => `<option value="${c.customerID}">${c.name} (${c.phone})</option>`).join('')}
            </select>
          </div>
          <div class="form__group" id="qo-customer-details"></div>
        </div>

        <div class="form__row">
          <div class="form__group">
            <label class="form__label" for="qo-cat">Filter Category</label>
            <select class="form__select" id="qo-cat" onchange="AdminApp.qoFilterProducts()">
              <option value="all">All Categories</option>
              ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div class="form__group">
            <label class="form__label" for="qo-search">Search Product</label>
            <input class="form__input" type="search" id="qo-search" placeholder="Search…" oninput="AdminApp.qoFilterProducts()">
          </div>
        </div>

        <div id="qo-products" style="max-height:200px;overflow-y:auto;border:1px solid var(--gray-200);border-radius:var(--radius-md);padding:.5rem;margin-bottom:1rem;">
          ${_qoRenderProducts()}
        </div>

        <div id="qo-cart-section">
          <h4 style="font-size:.9rem;font-weight:600;margin-bottom:.5rem;">Cart</h4>
          <div id="qo-cart" style="min-height:40px;"></div>
          <div id="qo-total" style="text-align:right;font-weight:700;margin-top:.5rem;"></div>
        </div>

        <div class="form__row" style="margin-top:1rem;">
          <div class="form__group">
            <label class="form__label" for="qo-address">Delivery Address</label>
            <input class="form__input" type="text" id="qo-address" placeholder="Full delivery address">
          </div>
          <div class="form__group">
            <label class="form__label" for="qo-payment">Payment Method</label>
            <select class="form__select" id="qo-payment">
              <option value="COD">Cash on Delivery</option>
              <option value="Online">Online Payment</option>
            </select>
          </div>
        </div>

        <div style="text-align:right;margin-top:1rem;">
          <button class="btn btn--primary" onclick="AdminApp.placeQuickOrder()">📦 Place Order</button>
        </div>
      </div>
    `;

    window._qoCart = [];
    Utils.showModal('modal-quick-order');
  }

  function _qoRenderProducts(filterCat, filterSearch) {
    const products = DB.products.getAll().filter(p => p.stockQuantity > 0);
    const cat = filterCat || 'all';
    const q   = (filterSearch || '').toLowerCase();
    const filtered = products.filter(p =>
      (cat === 'all' || p.category === cat) &&
      (!q || p.name.toLowerCase().includes(q))
    );
    if (filtered.length === 0) return '<p style="color:var(--gray-400);font-size:.85rem;padding:.5rem;">No products found</p>';
    return filtered.map(p => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:.3rem .5rem;border-bottom:1px solid var(--gray-100);">
        <span style="font-size:.85rem;">${p.emoji || ''} ${p.name} <small style="color:var(--gray-500);">${Utils.formatCurrency(p.price)}/${p.unit}</small></span>
        <button class="btn btn--primary btn--xs" onclick="AdminApp.qoAddItem('${p.productID}')">+ Add</button>
      </div>
    `).join('');
  }

  function qoFilterProducts() {
    const cat = document.getElementById('qo-cat')?.value || 'all';
    const q   = document.getElementById('qo-search')?.value || '';
    const el  = document.getElementById('qo-products');
    if (el) el.innerHTML = _qoRenderProducts(cat, q);
  }

  function qoLoadCustomer() {
    const custId = document.getElementById('qo-customer')?.value;
    const detEl  = document.getElementById('qo-customer-details');
    if (!detEl) return;
    if (!custId) { detEl.innerHTML = ''; return; }
    const c = DB.customers.getById(custId);
    if (!c) return;
    detEl.innerHTML = `<div class="alert alert--info" style="margin-top:1.5rem;">
      <strong>${c.name}</strong><br>${c.phone} | ${c.area}<br><small>${c.address}</small>
    </div>`;
    const addr = document.getElementById('qo-address');
    if (addr) addr.value = c.address;
  }

  function qoAddItem(productId) {
    if (!window._qoCart) window._qoCart = [];
    const product = DB.products.getById(productId);
    if (!product) return;
    const existing = window._qoCart.find(i => i.productID === productId);
    if (existing) {
      existing.quantity++;
    } else {
      window._qoCart.push({ productID: productId, name: product.name, price: product.price, quantity: 1, emoji: product.emoji || '', unit: product.unit });
    }
    _qoRenderCart();
  }

  function qoRemoveItem(productId) {
    if (!window._qoCart) return;
    window._qoCart = window._qoCart.filter(i => i.productID !== productId);
    _qoRenderCart();
  }

  function _qoRenderCart() {
    const cart  = window._qoCart || [];
    const cartEl = document.getElementById('qo-cart');
    const totEl  = document.getElementById('qo-total');
    if (!cartEl) return;
    if (cart.length === 0) { cartEl.innerHTML = '<p style="color:var(--gray-400);font-size:.85rem;">No items added</p>'; totEl.innerHTML = ''; return; }
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const fee = 150;
    const tax = subtotal * 0.05;
    cartEl.innerHTML = `<table class="admin-table" style="font-size:.82rem;">
      <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th></th></tr></thead>
      <tbody>
        ${cart.map(i => `<tr>
          <td>${i.emoji} ${i.name}</td>
          <td>${i.quantity}</td>
          <td>${Utils.formatCurrency(i.price * i.quantity)}</td>
          <td><button class="btn btn--danger btn--xs" onclick="AdminApp.qoRemoveItem('${i.productID}')">✕</button></td>
        </tr>`).join('')}
      </tbody>
    </table>`;
    totEl.innerHTML = `Subtotal: ${Utils.formatCurrency(subtotal)} + Fee: ${Utils.formatCurrency(fee)} + Tax: ${Utils.formatCurrency(tax)} = <strong>${Utils.formatCurrency(subtotal + fee + tax)}</strong>`;
  }

  function placeQuickOrder() {
    const custId = document.getElementById('qo-customer')?.value;
    if (!custId) { Utils.showToast('Please select a customer', 'error'); return; }
    if (!window._qoCart || window._qoCart.length === 0) { Utils.showToast('Please add at least one product', 'error'); return; }
    const address   = document.getElementById('qo-address')?.value || '';
    const payment   = document.getElementById('qo-payment')?.value || 'COD';
    const customer  = DB.customers.getById(custId);
    const subtotal  = window._qoCart.reduce((s, i) => s + i.price * i.quantity, 0);
    const fee       = 150;
    const tax       = Math.round(subtotal * 0.05 * 100) / 100;

    const orderData = {
      customerID:      custId,
      items:           window._qoCart.map(i => ({ ...i })),
      subtotal,
      deliveryFee:     fee,
      tax,
      totalAmount:     Math.round((subtotal + fee + tax) * 100) / 100,
      deliveryStatus:  'Received',
      paymentMethod:   payment,
      paymentStatus:   payment === 'COD' ? 'Pending' : 'Paid',
      deliveryAddress: address || (customer ? customer.address : ''),
      deliveryArea:    customer ? customer.area : '',
      postalCode:      customer ? customer.postalCode : '',
      deliverySlot:    'Standard Delivery',
      placedBy:        'CSR',
    };

    DB.orders.add(orderData);
    Utils.hideModal('modal-quick-order');
    Utils.showToast('Order placed successfully via CSR', 'success');
    _updateSidebarBadges();
    renderOrders();
  }

  /* ═══════════════════════════════════════════════════════════════════
     3. DELIVERY ASSIGNMENT (STAR FEATURE)
  ═══════════════════════════════════════════════════════════════════ */
  function renderAssignment() {
    const unassigned = DB.orders.getAll().filter(o => o.deliveryStatus === 'Received');
    const agents     = DB.agents.getAll();

    _content(`
      <div class="admin-page">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Delivery Assignment</h1>
            <p class="admin-page-subtitle">Proximity-based automated agent allocation</p>
          </div>
          <button class="btn btn--success btn--sm" onclick="AdminApp.autoAssignAll()"
            ${unassigned.length === 0 ? 'disabled' : ''}>
            ⚡ Auto-Assign All
          </button>
        </div>

        ${unassigned.length === 0
          ? `<div class="empty-state"><div class="empty-state__icon">✅</div>
              <div class="empty-state__title">All orders assigned!</div>
              <div class="empty-state__text">No pending orders awaiting delivery assignment.</div>
              <button class="btn btn--primary" onclick="AdminApp.navigate('orders')">View All Orders</button>
            </div>`
          : `<div class="assignment-layout">
              <!-- Left: Pending Orders List -->
              <div class="admin-card assignment-orders">
                <div class="admin-card__header">
                  <div class="admin-card__title">📦 Pending Orders <span class="badge badge--warning">${unassigned.length}</span></div>
                </div>
                <div id="assignment-order-list">
                  ${unassigned.map(o => _renderAssignmentOrderCard(o)).join('')}
                </div>
              </div>

              <!-- Right: Assignment Panel -->
              <div class="admin-card assignment-panel" id="assignment-panel">
                <div class="empty-state empty-state--sm">
                  <div class="empty-state__icon">👈</div>
                  <div class="empty-state__text">Select an order to see agent recommendations</div>
                </div>
              </div>
            </div>`
        }
      </div>
    `);
  }

  function _renderAssignmentOrderCard(order) {
    const cust = DB.customers.getById(order.customerID) || {};
    return `
      <div class="assignment-order-card" id="aoc-${order.orderID}" onclick="AdminApp.selectOrder('${order.orderID}')">
        <div class="assignment-order-card__header">
          <code class="assignment-order-card__id">${order.orderID}</code>
          <span class="badge badge--warning">Unassigned</span>
        </div>
        <div class="assignment-order-card__cust">${cust.name || '—'} · ${cust.phone || ''}</div>
        <div class="assignment-order-card__addr">📍 ${order.deliveryArea || cust.area || 'Unknown area'}</div>
        <div class="assignment-order-card__meta">
          ${(order.items || []).length} items · ${Utils.formatCurrency(order.totalAmount)} · ${order.paymentMethod || 'COD'}
        </div>
        <div class="assignment-order-card__time">${Utils.timeAgo(order.orderDate)}</div>
      </div>
    `;
  }

  let _selectedOrderId = null;

  function selectOrder(orderId) {
    _selectedOrderId = orderId;

    // Highlight selected card
    document.querySelectorAll('.assignment-order-card').forEach(c => c.classList.remove('assignment-order-card--active'));
    const card = document.getElementById('aoc-' + orderId);
    if (card) card.classList.add('assignment-order-card--active');

    const order      = DB.orders.getById(orderId);
    const cust       = DB.customers.getById(order.customerID) || {};
    const agents     = DB.agents.getAll();
    const onlineAgents = agents.filter(a => a.availabilityStatus === 'Online');

    // Get algorithm recommendations
    const recommendations = Algorithm.getRecommendedAgents(order, 5);
    const panel = document.getElementById('assignment-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="admin-card__header">
        <div class="admin-card__title">Agent Recommendations</div>
      </div>

      <!-- Order summary -->
      <div class="assignment-order-summary">
        <table class="detail-table" style="font-size:.83rem;">
          <tr><td>Order</td><td><code>${order.orderID}</code></td></tr>
          <tr><td>Customer</td><td>${cust.name} (${cust.phone || '—'})</td></tr>
          <tr><td>Deliver to</td><td>${order.deliveryArea || cust.area} · ${order.deliveryAddress || cust.address}</td></tr>
          <tr><td>Slot</td><td>${order.deliverySlot || 'Standard'}</td></tr>
          <tr><td>Total</td><td>${Utils.formatCurrency(order.totalAmount)}</td></tr>
        </table>
      </div>

      <div style="margin:1rem 0;">
        <h4 style="font-size:.85rem;font-weight:600;color:var(--gray-600);margin-bottom:.75rem;">
          🧠 Algorithm Recommendations — Score = (Distance × 0.6) + (Workload × 5) − (Rating × 2)
          <span style="color:var(--gray-400);font-weight:400;"> Lower score = better match</span>
        </h4>
        ${recommendations.length === 0
          ? `<div class="alert alert--warning">⚠️ No online agents available. Ask agents to go online first.</div>`
          : recommendations.map((rec, idx) => _renderAgentRecommendationCard(rec, idx, orderId)).join('')}
      </div>

      <hr style="border:none;border-top:1px solid var(--gray-200);margin:1rem 0;">

      <!-- Manual Assignment -->
      <div>
        <h4 style="font-size:.85rem;font-weight:600;color:var(--gray-600);margin-bottom:.5rem;">Or assign manually:</h4>
        <div style="display:flex;gap:.5rem;align-items:center;">
          <select class="form__select form__select--sm" id="manual-agent-select">
            <option value="">Select agent…</option>
            ${agents.map(a => `<option value="${a.agentID}">${a.name} (${a.currentLocation || a.area}) — ${a.availabilityStatus === 'Online' ? '🟢 Online' : '🔴 Offline'} | Workload: ${a.currentWorkload}</option>`).join('')}
          </select>
          <button class="btn btn--primary btn--sm" onclick="AdminApp.manualAssign('${orderId}')">Assign</button>
        </div>
      </div>
    `;
  }

  function _renderAgentRecommendationCard(rec, index, orderId) {
    const rankEmoji    = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index] || `#${index + 1}`;
    const statusColor  = rec.availabilityStatus === 'Online' ? 'var(--success)' : 'var(--danger)';
    const workloadColor = rec.currentWorkload >= 3 ? 'var(--warning)' : 'var(--success)';

    return `
      <div class="agent-rec-card ${index === 0 ? 'agent-rec-card--top' : ''}">
        <div class="agent-rec-card__rank">${rankEmoji}</div>
        <div class="agent-rec-card__info">
          <div class="agent-rec-card__name">${rec.name}</div>
          <div class="agent-rec-card__meta">
            <span>📍 ${rec.currentLocation || rec.area}</span>
            <span style="color:${statusColor};">${rec.availabilityStatus}</span>
            <span>⭐ ${(rec.rating || 5).toFixed(1)}</span>
            <span style="color:${workloadColor};">📦 ${rec.currentWorkload} active</span>
          </div>
          <div class="agent-rec-card__score-bar">
            <span class="agent-rec-card__score-label">Score: ${rec.score.toFixed(2)}</span>
            <span style="font-size:.75rem;color:var(--gray-500);">
              = dist(${rec.distance}km × 0.6) + load(${rec.currentWorkload} × 5) − rating(${(rec.rating || 5).toFixed(1)} × 2)
            </span>
          </div>
        </div>
        <button class="btn btn--success btn--sm agent-rec-card__btn"
          onclick="AdminApp.confirmAssign('${orderId}', '${rec.agentID}')">
          Assign
        </button>
      </div>
    `;
  }

  function confirmAssign(orderId, agentId) {
    const order = DB.orders.getById(orderId);
    const agent = DB.agents.getById(agentId);
    if (!order || !agent) return;

    document.getElementById('assign-confirm-title').textContent = `Assign ${agent.name} to order ${orderId}?`;
    document.getElementById('assign-confirm-desc').textContent  = `Agent is currently at ${agent.currentLocation || agent.area} with ${agent.currentWorkload} active deliveries. This will send an SMS to the customer and agent.`;

    _pendingAssign = { orderId, agentId };
    document.getElementById('btn-confirm-assign').onclick = () => doAssign(orderId, agentId);
    Utils.showModal('modal-assign-confirm');
  }

  function doAssign(orderId, agentId) {
    Utils.hideModal('modal-assign-confirm');
    Algorithm.assignAgent(orderId, agentId);
    Utils.showToast('Agent assigned successfully!', 'success');
    _updateSidebarBadges();
    renderAssignment();
  }

  function manualAssign(orderId) {
    const agentId = document.getElementById('manual-agent-select')?.value;
    if (!agentId) { Utils.showToast('Please select an agent', 'error'); return; }
    confirmAssign(orderId, agentId);
  }

  function autoAssignAll() {
    const unassigned = DB.orders.getAll().filter(o => o.deliveryStatus === 'Received');
    if (unassigned.length === 0) { Utils.showToast('No pending orders', 'info'); return; }

    let assigned = 0;
    let failed   = 0;
    unassigned.forEach(order => {
      const recs = Algorithm.getRecommendedAgents(order, 1);
      if (recs.length > 0) {
        Algorithm.assignAgent(order.orderID, recs[0].agentID);
        assigned++;
      } else {
        failed++;
      }
    });

    _updateSidebarBadges();
    Utils.showToast(`Auto-assigned ${assigned} order${assigned !== 1 ? 's' : ''}${failed > 0 ? `. ${failed} could not be assigned (no online agents).` : '.'}`, assigned > 0 ? 'success' : 'warning');
    renderAssignment();
  }

  /* ═══════════════════════════════════════════════════════════════════
     4. PRODUCTS
  ═══════════════════════════════════════════════════════════════════ */
  function renderProducts() {
    const s = _state.products;
    let products = DB.products.getAll();

    if (s.search) {
      const q = s.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (s.category !== 'all') products = products.filter(p => p.category === s.category);
    products.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

    const paginated  = Utils.paginateArray(products, s.page, s.perPage);
    const categories = [...new Set(DB.products.getAll().map(p => p.category))].sort();

    _content(`
      <div class="admin-page">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Products</h1>
            <p class="admin-page-subtitle">${products.length} products · ${categories.length} categories</p>
          </div>
          <div style="display:flex;gap:.5rem;">
            <button class="btn btn--outline-gray btn--sm" onclick="AdminApp.exportProducts()">⬇️ Export CSV</button>
            <button class="btn btn--primary btn--sm" onclick="AdminApp.openProductForm()">+ Add Product</button>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="admin-toolbar">
          <div class="admin-toolbar__search">
            <input class="form__input form__input--sm" type="search" placeholder="Search products…"
              value="${s.search}" oninput="AdminApp.setProductFilter('search', this.value)" id="products-search">
          </div>
          <div class="admin-toolbar__filters">
            <button class="btn btn--xs ${s.category === 'all' ? 'btn--primary' : 'btn--outline-gray'}"
              onclick="AdminApp.setProductFilter('category', 'all')">All</button>
            ${categories.map(c => `
              <button class="btn btn--xs ${s.category === c ? 'btn--primary' : 'btn--outline-gray'}"
                onclick="AdminApp.setProductFilter('category', '${c}')">${Utils.getCategoryEmoji ? Utils.getCategoryEmoji(c) : ''} ${c}</button>
            `).join('')}
          </div>
        </div>

        <!-- Table -->
        <div class="admin-card">
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${paginated.items.length === 0
                  ? `<tr><td colspan="7"><div class="empty-state empty-state--sm"><div class="empty-state__icon">🧺</div><div class="empty-state__text">No products found</div></div></td></tr>`
                  : paginated.items.map(p => `
                    <tr>
                      <td>
                        <div style="display:flex;align-items:center;gap:.5rem;">
                          <span style="font-size:1.4rem;">${p.emoji || '📦'}</span>
                          <span>${p.name}</span>
                        </div>
                      </td>
                      <td><span class="badge badge--info">${p.category}</span></td>
                      <td>${Utils.formatCurrency(p.price)}</td>
                      <td>per ${p.unit}</td>
                      <td>
                        <span class="badge ${p.stockQuantity === 0 ? 'badge--danger' : p.stockQuantity < 10 ? 'badge--warning' : 'badge--success'}">
                          ${p.stockQuantity}
                        </span>
                      </td>
                      <td>${p.featured ? '⭐' : '—'}</td>
                      <td>
                        <button class="btn btn--ghost btn--xs" onclick="AdminApp.openProductForm('${p.productID}')">Edit</button>
                        <button class="btn btn--danger btn--xs" onclick="AdminApp.deleteProduct('${p.productID}', '${p.name.replace(/'/g, "\\'")}')">Del</button>
                      </td>
                    </tr>`).join('')}
              </tbody>
            </table>
          </div>
          ${_paginationHtml(paginated, (p) => `AdminApp.setProductPage(${p})`)}
        </div>
      </div>
    `);
  }

  function setProductFilter(key, value) {
    _state.products[key] = value;
    _state.products.page = 1;
    renderProducts();
    if (key === 'search') {
      const el = document.getElementById('products-search');
      if (el) { el.focus(); el.setSelectionRange(value.length, value.length); }
    }
  }

  function setProductPage(p) {
    _state.products.page = p;
    renderProducts();
  }

  function openProductForm(productId) {
    const isEdit = !!productId;
    document.getElementById('modal-product-form-title').textContent = isEdit ? 'Edit Product' : 'Add Product';

    // Clear form
    ['pf-id','pf-name','pf-price','pf-stock','pf-emoji','pf-description'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const catSel = document.getElementById('pf-category');
    if (catSel) catSel.value = '';
    const unitSel = document.getElementById('pf-unit');
    if (unitSel) unitSel.value = 'kg';
    const featCb = document.getElementById('pf-featured');
    if (featCb) featCb.checked = false;

    if (isEdit) {
      const p = DB.products.getById(productId);
      if (!p) return;
      document.getElementById('pf-id').value          = p.productID;
      document.getElementById('pf-name').value        = p.name;
      document.getElementById('pf-category').value    = p.category;
      document.getElementById('pf-price').value       = p.price;
      document.getElementById('pf-unit').value        = p.unit;
      document.getElementById('pf-stock').value       = p.stockQuantity;
      document.getElementById('pf-emoji').value       = p.emoji || '';
      document.getElementById('pf-description').value = p.description || '';
      if (featCb) featCb.checked = !!p.featured;
    }

    Utils.showModal('modal-product-form');
  }

  function saveProduct(e) {
    if (e && e.preventDefault) e.preventDefault();

    const id    = document.getElementById('pf-id').value;
    const name  = document.getElementById('pf-name').value.trim();
    const cat   = document.getElementById('pf-category').value;
    const price = parseFloat(document.getElementById('pf-price').value);
    const unit  = document.getElementById('pf-unit').value;
    const stock = parseInt(document.getElementById('pf-stock').value, 10);
    const emoji = document.getElementById('pf-emoji').value.trim();
    const desc  = document.getElementById('pf-description').value.trim();
    const feat  = document.getElementById('pf-featured').checked;

    // Validate
    let valid = true;
    if (!name) { _formError('pf-name', 'Product name is required'); valid = false; } else _clearError('pf-name');
    if (!cat)  { _formError('pf-category', 'Please select a category'); valid = false; }
    if (!price || price <= 0) { _formError('pf-price', 'Enter a valid price'); valid = false; } else _clearError('pf-price');
    if (!valid) return;

    const data = { name, category: cat, price, unit, stockQuantity: isNaN(stock) ? 0 : stock, emoji, description: desc, featured: feat };

    if (id) {
      DB.products.update(id, data);
      Utils.showToast('Product updated', 'success');
    } else {
      DB.products.add({ ...data, popularity: 0 });
      Utils.showToast('Product added', 'success');
    }

    Utils.hideModal('modal-product-form');
    renderProducts();
  }

  function deleteProduct(productId, name) {
    document.getElementById('delete-confirm-title').textContent = `Delete "${name}"?`;
    document.getElementById('delete-confirm-desc').textContent  = 'This product will be permanently removed. Existing orders are not affected.';
    _pendingDelete = productId;
    document.getElementById('btn-confirm-delete').onclick = () => {
      DB.products.remove(productId);
      Utils.hideModal('modal-delete-confirm');
      Utils.showToast('Product deleted', 'success');
      renderProducts();
    };
    Utils.showModal('modal-delete-confirm');
  }

  function exportProducts() {
    const products = DB.products.getAll();
    const rows = products.map(p => ({
      'Product ID': p.productID,
      'Name':       p.name,
      'Category':   p.category,
      'Price (LKR)': p.price,
      'Unit':        p.unit,
      'Stock':       p.stockQuantity,
      'Featured':    p.featured ? 'Yes' : 'No',
    }));
    Utils.exportCSV(rows, 'freshgrocers_products.csv');
  }

  /* ═══════════════════════════════════════════════════════════════════
     5. CUSTOMERS
  ═══════════════════════════════════════════════════════════════════ */
  function renderCustomers() {
    const s = _state.customers;
    let customers = DB.customers.getAll();

    if (s.search) {
      const q = s.search.toLowerCase();
      customers = customers.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
    }
    if (s.status !== 'all') customers = customers.filter(c => (s.status === 'active' ? !c.suspended : c.suspended));
    customers.sort((a, b) => a.name.localeCompare(b.name));

    const paginated = Utils.paginateArray(customers, s.page, s.perPage);

    _content(`
      <div class="admin-page">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Customers</h1>
            <p class="admin-page-subtitle">${customers.length} registered customer${customers.length !== 1 ? 's' : ''}</p>
          </div>
          <button class="btn btn--outline-gray btn--sm" onclick="AdminApp.exportCustomers()">⬇️ Export CSV</button>
        </div>

        <!-- Toolbar -->
        <div class="admin-toolbar">
          <div class="admin-toolbar__search">
            <input class="form__input form__input--sm" type="search" placeholder="Search by name, email or phone…"
              value="${s.search}" oninput="AdminApp.setCustFilter('search', this.value)" id="cust-search">
          </div>
          <div class="admin-toolbar__filters">
            ${[['all','All'],['active','Active'],['suspended','Suspended']].map(([val, lbl]) =>
              `<button class="btn btn--xs ${s.status === val ? 'btn--primary' : 'btn--outline-gray'}"
                onclick="AdminApp.setCustFilter('status', '${val}')">${lbl}</button>`
            ).join('')}
          </div>
        </div>

        <!-- Table -->
        <div class="admin-card">
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Area</th>
                  <th>Orders</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${paginated.items.length === 0
                  ? `<tr><td colspan="8"><div class="empty-state empty-state--sm"><div class="empty-state__icon">👥</div><div class="empty-state__text">No customers found</div></div></td></tr>`
                  : paginated.items.map(c => {
                    const orderCount = DB.orders.getAll().filter(o => o.customerID === c.customerID).length;
                    return `<tr>
                      <td>
                        <div style="display:flex;align-items:center;gap:.5rem;">
                          <div class="avatar avatar--sm">${c.name.charAt(0)}</div>
                          <span>${c.name}</span>
                        </div>
                      </td>
                      <td>${c.email}</td>
                      <td>${c.phone || '—'}</td>
                      <td>${c.area || '—'}</td>
                      <td>${orderCount}</td>
                      <td><span class="badge ${c.suspended ? 'badge--danger' : 'badge--success'}">${c.suspended ? 'Suspended' : 'Active'}</span></td>
                      <td>${Utils.formatDate(c.joinedDate || c.createdAt || '')}</td>
                      <td>
                        <button class="btn btn--ghost btn--xs" onclick="AdminApp.viewCustomer('${c.customerID}')">View</button>
                        <button class="btn btn--${c.suspended ? 'success' : 'warning'} btn--xs"
                          onclick="AdminApp.toggleCustomer('${c.customerID}', ${!c.suspended})">
                          ${c.suspended ? 'Activate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>`;
                  }).join('')}
              </tbody>
            </table>
          </div>
          ${_paginationHtml(paginated, (p) => `AdminApp.setCustPage(${p})`)}
        </div>
      </div>
    `);
  }

  function setCustFilter(key, value) {
    _state.customers[key] = value;
    _state.customers.page = 1;
    renderCustomers();
    if (key === 'search') {
      const el = document.getElementById('cust-search');
      if (el) { el.focus(); el.setSelectionRange(value.length, value.length); }
    }
  }

  function setCustPage(p) {
    _state.customers.page = p;
    renderCustomers();
  }

  function viewCustomer(customerId) {
    const c = DB.customers.getById(customerId);
    if (!c) return;
    const orders  = DB.orders.getAll().filter(o => o.customerID === customerId);
    const revenue = orders.filter(o => o.deliveryStatus === 'Delivered').reduce((s, o) => s + o.totalAmount, 0);

    document.getElementById('modal-order-detail-title').textContent = `Customer: ${c.name}`;
    document.getElementById('modal-order-detail-body').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1rem;">
        <div>
          <h3 style="font-size:.9rem;color:var(--gray-500);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em;">Profile</h3>
          <table class="detail-table">
            <tr><td>Name</td><td>${c.name}</td></tr>
            <tr><td>Email</td><td>${c.email}</td></tr>
            <tr><td>Phone</td><td>${c.phone || '—'}</td></tr>
            <tr><td>Address</td><td>${c.address || '—'}</td></tr>
            <tr><td>Area</td><td>${c.area || '—'}</td></tr>
            <tr><td>Status</td><td><span class="badge ${c.suspended ? 'badge--danger' : 'badge--success'}">${c.suspended ? 'Suspended' : 'Active'}</span></td></tr>
          </table>
        </div>
        <div>
          <h3 style="font-size:.9rem;color:var(--gray-500);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em;">Statistics</h3>
          <table class="detail-table">
            <tr><td>Total Orders</td><td>${orders.length}</td></tr>
            <tr><td>Completed</td><td>${orders.filter(o => o.deliveryStatus === 'Delivered').length}</td></tr>
            <tr><td>Lifetime Revenue</td><td>${Utils.formatCurrency(revenue)}</td></tr>
            <tr><td>Avg Order Value</td><td>${orders.length > 0 ? Utils.formatCurrency(revenue / orders.filter(o => o.deliveryStatus === 'Delivered').length || 0) : '—'}</td></tr>
          </table>
        </div>
      </div>
      <h3 style="font-size:.9rem;color:var(--gray-500);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em;">Order History</h3>
      <table class="admin-table">
        <thead><tr><th>Order ID</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          ${orders.length === 0
            ? `<tr><td colspan="4" style="text-align:center;color:var(--gray-400);">No orders</td></tr>`
            : orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).map(o => `
              <tr>
                <td><code>${o.orderID}</code></td>
                <td>${Utils.formatDate(o.orderDate)}</td>
                <td>${Utils.formatCurrency(o.totalAmount)}</td>
                <td>${_statusBadge(o.deliveryStatus)}</td>
              </tr>`).join('')}
        </tbody>
      </table>
    `;
    Utils.showModal('modal-order-detail');
  }

  function toggleCustomer(customerId, suspend) {
    DB.customers.update(customerId, { suspended: suspend });
    Utils.showToast(`Customer ${suspend ? 'suspended' : 'activated'}`, suspend ? 'warning' : 'success');
    renderCustomers();
  }

  function exportCustomers() {
    const customers = DB.customers.getAll();
    const rows = customers.map(c => ({
      'Customer ID': c.customerID,
      'Name':        c.name,
      'Email':       c.email,
      'Phone':       c.phone || '',
      'Area':        c.area || '',
      'Status':      c.suspended ? 'Suspended' : 'Active',
      'Total Orders': DB.orders.getAll().filter(o => o.customerID === c.customerID).length,
    }));
    Utils.exportCSV(rows, 'freshgrocers_customers.csv');
  }

  /* ═══════════════════════════════════════════════════════════════════
     6. AGENTS
  ═══════════════════════════════════════════════════════════════════ */
  function renderAgents() {
    const s = _state.agents;
    let agents = DB.agents.getAll();

    if (s.search) {
      const q = s.search.toLowerCase();
      agents = agents.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
    }
    agents.sort((a, b) => a.name.localeCompare(b.name));
    const paginated = Utils.paginateArray(agents, s.page, s.perPage);

    _content(`
      <div class="admin-page">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Delivery Agents</h1>
            <p class="admin-page-subtitle">${agents.length} agent${agents.length !== 1 ? 's' : ''} · ${agents.filter(a => a.availabilityStatus === 'Online').length} online</p>
          </div>
          <button class="btn btn--primary btn--sm" onclick="AdminApp.openAgentForm()">+ Add Agent</button>
        </div>

        <!-- Toolbar -->
        <div class="admin-toolbar">
          <div class="admin-toolbar__search">
            <input class="form__input form__input--sm" type="search" placeholder="Search agents…"
              value="${s.search}" oninput="AdminApp.setAgentFilter('search', this.value)" id="agent-search">
          </div>
        </div>

        <!-- Cards -->
        <div class="agent-cards-grid">
          ${paginated.items.length === 0
            ? `<div class="empty-state"><div class="empty-state__icon">🛵</div><div class="empty-state__text">No agents found</div></div>`
            : paginated.items.map(a => {
              const deliveries  = DB.deliveries.getAll().filter(d => d.agentID === a.agentID);
              const completed   = deliveries.filter(d => d.deliveryStatus === 'Delivered').length;
              return `
                <div class="agent-profile-card">
                  <div class="agent-profile-card__header">
                    <div class="avatar">${a.name.charAt(0)}</div>
                    <div>
                      <div class="agent-profile-card__name">${a.name}</div>
                      <span class="badge ${a.availabilityStatus === 'Online' ? 'badge--success' : 'badge--danger'}">${a.availabilityStatus}</span>
                    </div>
                  </div>
                  <div class="agent-profile-card__stats">
                    <div><strong>${Utils.renderStars(a.rating || 5)}</strong><div style="font-size:.75rem;color:var(--gray-500);">Rating</div></div>
                    <div><strong>${a.currentWorkload}</strong><div style="font-size:.75rem;color:var(--gray-500);">Active</div></div>
                    <div><strong>${completed}</strong><div style="font-size:.75rem;color:var(--gray-500);">Completed</div></div>
                    <div><strong>${a.totalDeliveries || completed}</strong><div style="font-size:.75rem;color:var(--gray-500);">Total</div></div>
                  </div>
                  <table class="detail-table" style="margin:.75rem 0;font-size:.82rem;">
                    <tr><td>Email</td><td>${a.email}</td></tr>
                    <tr><td>Phone</td><td>${a.phone || '—'}</td></tr>
                    <tr><td>Area</td><td>${a.currentLocation || a.area}</td></tr>
                    <tr><td>Vehicle</td><td>${a.vehicleNumber || '—'}</td></tr>
                  </table>
                  <div style="display:flex;gap:.5rem;">
                    <button class="btn btn--${a.availabilityStatus === 'Online' ? 'warning' : 'success'} btn--sm btn--block"
                      onclick="AdminApp.toggleAgentStatus('${a.agentID}', '${a.availabilityStatus === 'Online' ? 'Offline' : 'Online'}')">
                      ${a.availabilityStatus === 'Online' ? 'Set Offline' : 'Set Online'}
                    </button>
                    <button class="btn btn--ghost btn--sm" onclick="AdminApp.deleteAgent('${a.agentID}', '${a.name.replace(/'/g, "\\'")}')">🗑</button>
                  </div>
                </div>`;
            }).join('')}
        </div>
        ${_paginationHtml(paginated, (p) => `AdminApp.setAgentPage(${p})`)}
      </div>
    `);
  }

  function setAgentFilter(key, value) {
    _state.agents[key] = value;
    _state.agents.page = 1;
    renderAgents();
    if (key === 'search') {
      const el = document.getElementById('agent-search');
      if (el) { el.focus(); el.setSelectionRange(value.length, value.length); }
    }
  }

  function setAgentPage(p) {
    _state.agents.page = p;
    renderAgents();
  }

  function openAgentForm(agentId) {
    document.getElementById('modal-agent-form-title').textContent = agentId ? 'Edit Agent' : 'Add Delivery Agent';
    ['af-id','af-name','af-email','af-phone','af-vehicle','af-password'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('af-area').value = '';

    if (agentId) {
      const a = DB.agents.getById(agentId);
      if (a) {
        document.getElementById('af-id').value      = a.agentID;
        document.getElementById('af-name').value    = a.name;
        document.getElementById('af-email').value   = a.email;
        document.getElementById('af-phone').value   = a.phone || '';
        document.getElementById('af-vehicle').value = a.vehicleNumber || '';
        document.getElementById('af-area').value    = a.area;
        document.getElementById('af-password').removeAttribute('required');
      }
    }
    Utils.showModal('modal-agent-form');
  }

  function saveAgent() {
    const id       = document.getElementById('af-id').value;
    const name     = document.getElementById('af-name').value.trim();
    const email    = document.getElementById('af-email').value.trim();
    const phone    = document.getElementById('af-phone').value.trim();
    const vehicle  = document.getElementById('af-vehicle').value.trim();
    const area     = document.getElementById('af-area').value;
    const password = document.getElementById('af-password').value;

    let valid = true;
    if (!name)  { _formError('af-name', 'Name is required'); valid = false; }
    if (!Utils.validateEmail(email)) { _formError('af-email', 'Valid email required'); valid = false; }
    if (!id && !password) { _formError('af-password', 'Password required for new agents'); valid = false; }

    if (!valid) return;

    const data = { name, email, phone, vehicleNumber: vehicle, area, currentLocation: area };
    if (password) data.password = Utils.hashPassword(password);

    if (id) {
      DB.agents.update(id, data);
      Utils.showToast('Agent updated', 'success');
    } else {
      DB.agents.add({
        ...data,
        availabilityStatus: 'Offline',
        postalCode:         '',
        rating:             5.0,
        currentWorkload:    0,
        totalDeliveries:    0,
      });
      Utils.showToast('Agent added', 'success');
    }

    Utils.hideModal('modal-agent-form');
    renderAgents();
  }

  function toggleAgentStatus(agentId, newStatus) {
    DB.agents.update(agentId, { availabilityStatus: newStatus });
    Utils.showToast(`Agent set to ${newStatus}`, 'info');
    renderAgents();
  }

  function deleteAgent(agentId, name) {
    document.getElementById('delete-confirm-title').textContent = `Remove agent "${name}"?`;
    document.getElementById('delete-confirm-desc').textContent  = 'The agent account will be deleted. Existing deliveries are not affected.';
    document.getElementById('btn-confirm-delete').onclick = () => {
      DB.agents.remove(agentId);
      Utils.hideModal('modal-delete-confirm');
      Utils.showToast('Agent removed', 'success');
      renderAgents();
    };
    Utils.showModal('modal-delete-confirm');
  }

  /* ═══════════════════════════════════════════════════════════════════
     7. ANALYTICS
  ═══════════════════════════════════════════════════════════════════ */
  function renderAnalytics() {
    const orders   = DB.orders.getAll();
    const agents   = DB.agents.getAll();
    const products = DB.products.getAll();

    const delivered = orders.filter(o => o.deliveryStatus === 'Delivered');
    const totalRev  = delivered.reduce((s, o) => s + o.totalAmount, 0);
    const avgOrder  = delivered.length > 0 ? totalRev / delivered.length : 0;

    // Revenue last 30 days
    const rev30 = _getRevenueLastNDays(orders, 30);

    // Top products by order frequency
    const productFreq = {};
    orders.forEach(o => (o.items || []).forEach(item => {
      productFreq[item.name] = (productFreq[item.name] || 0) + item.quantity;
    }));
    const topProducts = Object.entries(productFreq)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([name, qty]) => ({ name, qty }));

    // Category revenue
    const catRevenue = {};
    delivered.forEach(o => (o.items || []).forEach(item => {
      const prod = products.find(p => p.productID === item.productID || p.name === item.name);
      const cat  = prod ? prod.category : 'Other';
      catRevenue[cat] = (catRevenue[cat] || 0) + item.price * item.quantity;
    }));
    const catData = Object.entries(catRevenue).sort((a, b) => b[1] - a[1]);

    // Agent performance
    const agentPerf = agents.map(a => {
      const agentDeliveries  = DB.deliveries.getAll().filter(d => d.agentID === a.agentID && d.deliveryStatus === 'Delivered');
      const agentRevenue     = DB.orders.getAll()
        .filter(o => o.assignedAgentID === a.agentID && o.deliveryStatus === 'Delivered')
        .reduce((s, o) => s + o.totalAmount, 0);
      const feedback         = DB.feedback.getAll().filter(f => f.agentID === a.agentID);
      const avgRating        = feedback.length > 0 ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : a.rating;
      return { ...a, completedDeliveries: agentDeliveries.length, agentRevenue, avgRating };
    }).sort((a, b) => b.completedDeliveries - a.completedDeliveries);

    // Feedback stats
    const allFeedback = DB.feedback.getAll();
    const avgSystemRating = allFeedback.length > 0
      ? allFeedback.reduce((s, f) => s + f.rating, 0) / allFeedback.length : 0;

    const maxProd = Math.max(...topProducts.map(p => p.qty), 1);
    const maxCat  = Math.max(...catData.map(d => d[1]), 1);
    const maxRev30 = Math.max(...rev30.map(d => d.value), 1);

    _content(`
      <div class="admin-page">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Analytics & Reporting</h1>
            <p class="admin-page-subtitle">Business intelligence overview</p>
          </div>
          <button class="btn btn--outline-gray btn--sm" onclick="AdminApp.exportAnalytics()">⬇️ Export Report</button>
        </div>

        <!-- KPI Strip -->
        <div class="admin-metrics" style="margin-bottom:1.5rem;">
          <div class="metric-card">
            <div class="metric-card__icon metric-card__icon--green">💰</div>
            <div class="metric-card__body">
              <div class="metric-card__value">${Utils.formatCurrency(totalRev)}</div>
              <div class="metric-card__label">Gross Revenue</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-card__icon metric-card__icon--blue">📦</div>
            <div class="metric-card__body">
              <div class="metric-card__value">${delivered.length}</div>
              <div class="metric-card__label">Completed Orders</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-card__icon metric-card__icon--purple">🧾</div>
            <div class="metric-card__body">
              <div class="metric-card__value">${Utils.formatCurrency(avgOrder)}</div>
              <div class="metric-card__label">Avg Order Value</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-card__icon metric-card__icon--orange">⭐</div>
            <div class="metric-card__body">
              <div class="metric-card__value">${avgSystemRating.toFixed(1)}/5</div>
              <div class="metric-card__label">Avg Customer Rating</div>
            </div>
          </div>
        </div>

        <div class="analytics-grid">

          <!-- Revenue 30 days -->
          <div class="admin-card analytics-card--wide">
            <div class="admin-card__header">
              <div class="admin-card__title">📈 Revenue — Last 30 Days</div>
            </div>
            <div class="bar-chart-wrap bar-chart-wrap--tall">
              <div class="bar-chart bar-chart--dense">
                ${rev30.map(d => `
                  <div class="bar-chart__item">
                    <div class="bar-chart__bar-wrap">
                      <div class="bar-chart__bar" style="height:${Math.round((d.value / maxRev30) * 120)}px;" title="${Utils.formatCurrency(d.value)}"></div>
                    </div>
                    <div class="bar-chart__label" style="font-size:.6rem;">${d.label}</div>
                  </div>`).join('')}
              </div>
            </div>
          </div>

          <!-- Top Products -->
          <div class="admin-card">
            <div class="admin-card__header">
              <div class="admin-card__title">🏆 Top Products by Orders</div>
            </div>
            <div style="padding:0.25rem 0;">
              ${topProducts.map((p, i) => `
                <div style="margin-bottom:.6rem;">
                  <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:2px;">
                    <span>${i + 1}. ${p.name}</span><span style="color:var(--gray-600);">${p.qty} units</span>
                  </div>
                  <div class="progress" style="height:8px;"><div class="progress__bar" style="width:${Math.round((p.qty / maxProd) * 100)}%;"></div></div>
                </div>`).join('')}
            </div>
          </div>

          <!-- Category Revenue -->
          <div class="admin-card">
            <div class="admin-card__header">
              <div class="admin-card__title">🧺 Revenue by Category</div>
            </div>
            <div style="padding:0.25rem 0;">
              ${catData.length === 0
                ? '<p style="color:var(--gray-400);font-size:.85rem;">No data yet</p>'
                : catData.map(([cat, rev]) => `
                  <div style="margin-bottom:.6rem;">
                    <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:2px;">
                      <span>${cat}</span><span style="color:var(--gray-600);">${Utils.formatCurrency(rev)}</span>
                    </div>
                    <div class="progress" style="height:8px;"><div class="progress__bar progress__bar--green" style="width:${Math.round((rev / maxCat) * 100)}%;"></div></div>
                  </div>`).join('')}
            </div>
          </div>

          <!-- Agent Performance Table -->
          <div class="admin-card analytics-card--wide">
            <div class="admin-card__header">
              <div class="admin-card__title">🛵 Agent Performance</div>
            </div>
            <div class="table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Area</th>
                    <th>Status</th>
                    <th>Deliveries</th>
                    <th>Revenue Handled</th>
                    <th>Rating</th>
                    <th>Workload</th>
                  </tr>
                </thead>
                <tbody>
                  ${agentPerf.map(a => `<tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:.5rem;">
                        <div class="avatar avatar--sm">${a.name.charAt(0)}</div>${a.name}
                      </div>
                    </td>
                    <td>${a.currentLocation || a.area}</td>
                    <td><span class="badge ${a.availabilityStatus === 'Online' ? 'badge--success' : 'badge--danger'}">${a.availabilityStatus}</span></td>
                    <td>${a.completedDeliveries}</td>
                    <td>${Utils.formatCurrency(a.agentRevenue)}</td>
                    <td>${Utils.renderStars(a.avgRating)} ${a.avgRating.toFixed(1)}</td>
                    <td><span class="badge ${a.currentWorkload >= 3 ? 'badge--warning' : 'badge--success'}">${a.currentWorkload}</span></td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Customer Feedback Breakdown -->
          <div class="admin-card">
            <div class="admin-card__header">
              <div class="admin-card__title">⭐ Rating Distribution</div>
            </div>
            ${_renderRatingDistribution(allFeedback)}
          </div>

          <!-- Order Fulfilment Rate -->
          <div class="admin-card">
            <div class="admin-card__header">
              <div class="admin-card__title">📊 Order Funnel</div>
            </div>
            ${_renderStatusBreakdown(orders)}
          </div>

        </div>
      </div>
    `);
  }

  function _getRevenueLastNDays(orders, n) {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label   = d.toLocaleDateString('en-LK', { day: 'numeric', month: 'short' });
      const dateStr = d.toISOString().slice(0, 10);
      const rev = orders
        .filter(o => o.deliveryStatus === 'Delivered' && o.orderDate && o.orderDate.startsWith(dateStr))
        .reduce((s, o) => s + o.totalAmount, 0);
      days.push({ label, value: rev });
    }
    return days;
  }

  function _renderRatingDistribution(feedback) {
    const total = feedback.length || 1;
    const dist  = [5, 4, 3, 2, 1].map(r => ({
      stars: r,
      count: feedback.filter(f => Math.round(f.rating) === r).length,
    }));
    return `<div style="padding:0.25rem 0;">
      ${dist.map(d => `
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem;">
          <span style="width:20px;font-size:.8rem;">${d.stars}★</span>
          <div class="progress" style="flex:1;height:10px;">
            <div class="progress__bar progress__bar--yellow" style="width:${Math.round((d.count / total) * 100)}%;"></div>
          </div>
          <span style="width:24px;font-size:.8rem;text-align:right;color:var(--gray-600);">${d.count}</span>
        </div>`).join('')}
      <div style="font-size:.8rem;color:var(--gray-500);margin-top:.5rem;">${feedback.length} review${feedback.length !== 1 ? 's' : ''} total</div>
    </div>`;
  }

  function exportAnalytics() {
    const orders   = DB.orders.getAll().filter(o => o.deliveryStatus === 'Delivered');
    const rows = orders.map(o => {
      const c = DB.customers.getById(o.customerID) || {};
      const a = o.assignedAgentID ? (DB.agents.getById(o.assignedAgentID) || {}) : {};
      return {
        'Order ID':    o.orderID,
        'Date':        Utils.formatDate(o.orderDate),
        'Customer':    c.name || '',
        'Area':        o.deliveryArea || c.area || '',
        'Agent':       a.name || 'Unassigned',
        'Total (LKR)': o.totalAmount,
        'Payment':     o.paymentMethod || 'COD',
        'Status':      o.deliveryStatus,
      };
    });
    Utils.exportCSV(rows, `freshgrocers_report_${new Date().toISOString().slice(0, 10)}.csv`);
    Utils.showToast('Report exported', 'success');
  }

  /* ── Public API ───────────────────────────────────────────────────── */
  return {
    init,
    navigate,
    openSidebar,
    closeSidebar,

    // Orders
    setOrderFilter,
    setOrderPage,
    viewOrder,
    openQuickOrder,
    qoFilterProducts,
    qoLoadCustomer,
    qoAddItem,
    qoRemoveItem,
    placeQuickOrder,

    // Assignment
    selectOrder,
    confirmAssign,
    doAssign,
    manualAssign,
    autoAssignAll,

    // Products
    setProductFilter,
    setProductPage,
    openProductForm,
    saveProduct,
    deleteProduct,
    exportProducts,

    // Customers
    setCustFilter,
    setCustPage,
    viewCustomer,
    toggleCustomer,
    exportCustomers,

    // Agents
    setAgentFilter,
    setAgentPage,
    openAgentForm,
    saveAgent,
    toggleAgentStatus,
    deleteAgent,

    // Analytics
    exportAnalytics,
  };
})();
