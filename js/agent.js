/**
 * Fresh Grocers — Delivery Agent Portal SPA
 */

const AgentApp = (() => {

  let currentAgent = null;

  const AREAS = [
    { v: 'Colombo 1', p: '00100' }, { v: 'Colombo 2', p: '00200' }, { v: 'Colombo 3', p: '00300' },
    { v: 'Colombo 4', p: '00400' }, { v: 'Colombo 5', p: '00500' }, { v: 'Colombo 6', p: '00600' },
    { v: 'Colombo 7', p: '00700' }, { v: 'Colombo 10', p: '01000' }, { v: 'Colombo 12', p: '01200' },
    { v: 'Colombo 15', p: '01500' }, { v: 'Nugegoda', p: '10250' }, { v: 'Dehiwala', p: '10350' },
    { v: 'Ratmalana', p: '10390' }, { v: 'Moratuwa', p: '10400' }, { v: 'Gampaha', p: '11000' },
    { v: 'Negombo', p: '11500' }, { v: 'Kandy', p: '20000' }, { v: 'Galle', p: '80000' }
  ];

  /* ─── Init ─────────────────────────────────────────────── */
  function init() {
    currentAgent = Auth.requireAgent();
    if (!currentAgent) return;

    updateNavUI();
    window.addEventListener('hashchange', () => route(location.hash));
    route(location.hash || '#dashboard');
  }

  function route(hash) {
    const view = hash.replace('#', '') || 'dashboard';
    const views = ['dashboard', 'deliveries', 'performance'];
    const navViews = views.includes(view) ? view : 'dashboard';

    // Update nav active states
    views.forEach(v => {
      document.getElementById(`nav-${v}`)?.classList.toggle('agent-nav__link--active', v === navViews);
      document.getElementById(`mob-${v}`)?.classList.toggle('agent-bottom-nav__item--active', v === navViews);
    });

    Utils.scrollToTop(false);
    switch (navViews) {
      case 'deliveries':   renderDeliveries(); break;
      case 'performance':  renderPerformance(); break;
      default:             renderDashboard(); break;
    }
  }

  function navigate(view) {
    location.hash = view;
  }

  function updateNavUI() {
    const agent = DB.agents.getById(currentAgent.agentID);
    if (!agent) return;
    currentAgent = agent;

    const av = document.getElementById('nav-avatar');
    if (av) av.textContent = agent.name[0];

    const toggle = document.getElementById('status-toggle');
    if (toggle) toggle.checked = agent.availabilityStatus === 'Online';

    const label = document.getElementById('status-label');
    if (label) label.textContent = agent.availabilityStatus;
  }

  /* ─── Status Toggle ───────────────────────────────────── */
  function toggleStatus(isOnline) {
    const newStatus = isOnline ? 'Online' : 'Offline';
    DB.agents.update(currentAgent.agentID, { availabilityStatus: newStatus });
    currentAgent = DB.agents.getById(currentAgent.agentID);

    const label = document.getElementById('status-label');
    if (label) label.textContent = newStatus;

    Utils.showToast(
      isOnline ? '✅ You are now Online and accepting deliveries.' : '⏸ You are now Offline.',
      isOnline ? 'success' : 'info'
    );

    // Re-render current view
    route(location.hash || '#dashboard');
  }

  /* ─── VIEW: Dashboard ─────────────────────────────────── */
  function renderDashboard() {
    const agent = DB.agents.getById(currentAgent.agentID);
    const myDeliveries = DB.deliveries.getByAgent(agent.agentID);
    const todayStr = new Date().toDateString();
    const todayDeliveries = myDeliveries.filter(d => d.deliveryStatus === 'Delivered' && new Date(d.completedDate || d.assignedDate).toDateString() === todayStr);
    const activeDeliveries = DB.deliveries.getActiveByAgent(agent.agentID);
    const agentFeedback = DB.feedback.getByAgent(agent.agentID);

    // Calculate today's earnings (from COD + online orders)
    let todayEarnings = 0;
    todayDeliveries.forEach(d => {
      const order = DB.orders.getById(d.orderID);
      if (order) todayEarnings += 75; // LKR 75 per delivery commission
    });

    document.getElementById('agent-content').innerHTML = `
      <div class="animate-fadeIn">
        <!-- Welcome Banner -->
        <div class="agent-status-banner agent-status-banner--${agent.availabilityStatus.toLowerCase()}" style="margin-bottom:1.5rem;">
          <div class="agent-status-banner__icon">${agent.availabilityStatus === 'Online' ? '🟢' : '⏸'}</div>
          <div style="flex:1;">
            <div class="agent-status-banner__title">
              ${agent.availabilityStatus === 'Online' ? `You're Online, ${agent.name.split(' ')[0]}!` : `You're Offline, ${agent.name.split(' ')[0]}`}
            </div>
            <div class="agent-status-banner__desc">
              ${agent.availabilityStatus === 'Online'
                ? `Location: ${agent.currentLocation} · Ready to accept deliveries`
                : 'Toggle Online to start accepting delivery assignments'}
            </div>
          </div>
          <button class="btn btn--outline-gray btn--sm" onclick="AgentApp.openLocationModal()" style="${agent.availabilityStatus === 'Online' ? '' : 'display:none'}">
            📍 Update Location
          </button>
        </div>

        <!-- Today's Stats -->
        <div class="agent-stats">
          <div class="agent-stat">
            <div class="agent-stat__icon">📦</div>
            <div class="agent-stat__value">${activeDeliveries.length}</div>
            <div class="agent-stat__label">Active Now</div>
          </div>
          <div class="agent-stat">
            <div class="agent-stat__icon">✅</div>
            <div class="agent-stat__value">${todayDeliveries.length}</div>
            <div class="agent-stat__label">Delivered Today</div>
          </div>
          <div class="agent-stat">
            <div class="agent-stat__icon">💰</div>
            <div class="agent-stat__value">${Utils.formatCurrency(todayEarnings).replace('LKR ','')}
            </div>
            <div class="agent-stat__label">Earned Today</div>
          </div>
        </div>

        <!-- Active Deliveries -->
        ${activeDeliveries.length > 0 ? `
          <div class="delivery-section">
            <div class="delivery-section__title">
              📦 Active Deliveries
              <span class="delivery-section__badge">${activeDeliveries.length}</span>
            </div>
            ${activeDeliveries.map(d => renderDeliveryCard(d, 'dashboard')).join('')}
          </div>
        ` : `
          <div class="card p-5 text-center mb-4">
            <div style="font-size:3rem;margin-bottom:1rem;">📭</div>
            <div style="font-weight:600;color:var(--gray-700);margin-bottom:.5rem;">No Active Deliveries</div>
            <div class="text-muted text-sm">${agent.availabilityStatus === 'Online' ? 'New assignments will appear here automatically.' : 'Go Online to start receiving delivery assignments.'}</div>
          </div>
        `}

        <!-- Quick Links -->
        <div class="grid-3" style="margin-top:1.5rem;">
          <button class="card p-4 text-center" onclick="AgentApp.navigate('deliveries')" style="cursor:pointer;border:none;background:white;width:100%;font-family:inherit;">
            <div style="font-size:2rem;margin-bottom:.5rem;">📦</div>
            <div style="font-weight:600;font-size:.875rem;">All Deliveries</div>
            <div class="text-muted text-sm">${myDeliveries.length} total</div>
          </button>
          <button class="card p-4 text-center" onclick="AgentApp.navigate('performance')" style="cursor:pointer;border:none;background:white;width:100%;font-family:inherit;">
            <div style="font-size:2rem;margin-bottom:.5rem;">⭐</div>
            <div style="font-weight:600;font-size:.875rem;">My Rating</div>
            <div style="color:var(--warning);font-weight:700;">${agent.rating.toFixed(1)}/5.0</div>
          </button>
          <button class="card p-4 text-center" onclick="AgentApp.openLocationModal()" style="cursor:pointer;border:none;background:white;width:100%;font-family:inherit;">
            <div style="font-size:2rem;margin-bottom:.5rem;">📍</div>
            <div style="font-weight:600;font-size:.875rem;">My Location</div>
            <div class="text-muted text-sm">${agent.currentLocation}</div>
          </button>
        </div>
      </div>
    `;
  }

  /* ─── VIEW: Deliveries ────────────────────────────────── */
  function renderDeliveries() {
    const myDeliveries = DB.deliveries.getByAgent(currentAgent.agentID)
      .sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate));

    const active    = myDeliveries.filter(d => d.deliveryStatus !== 'Delivered');
    const completed = myDeliveries.filter(d => d.deliveryStatus === 'Delivered');

    document.getElementById('agent-content').innerHTML = `
      <div class="animate-fadeIn">
        <h2 style="margin-bottom:1.5rem;font-size:1.25rem;">📦 My Deliveries</h2>

        ${active.length > 0 ? `
          <div class="delivery-section">
            <div class="delivery-section__title">
              Active
              <span class="delivery-section__badge">${active.length}</span>
            </div>
            ${active.map(d => renderDeliveryCard(d, 'active')).join('')}
          </div>
        ` : ''}

        ${completed.length > 0 ? `
          <div class="delivery-section">
            <div class="delivery-section__title">Completed Today</div>
            ${completed.slice(0, 5).map(d => renderDeliveryCard(d, 'completed')).join('')}
          </div>
        ` : ''}

        ${myDeliveries.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon">📭</div>
            <div class="empty-state__title">No deliveries yet</div>
            <div class="empty-state__desc">Make sure you're Online to receive new assignments.</div>
            <button class="btn btn--primary" onclick="AgentApp.navigate('dashboard')">Go to Dashboard</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderDeliveryCard(delivery, context) {
    const order   = DB.orders.getById(delivery.orderID);
    const customer = order ? DB.customers.getById(order.customerID) : null;
    if (!order || !customer) return '';

    const isAssigned  = delivery.deliveryStatus === 'Assigned';
    const isInTransit = delivery.deliveryStatus === 'In Transit';
    const isDone      = delivery.deliveryStatus === 'Delivered';

    const cardClass = isDone ? 'delivery-card--done' : isInTransit ? 'delivery-card--transit' : 'delivery-card--urgent';

    return `
      <div class="delivery-card ${cardClass}">
        <div class="delivery-card__header">
          <span class="delivery-card__order-id">${order.orderID}</span>
          <div style="display:flex;gap:.5rem;align-items:center;">
            ${Utils.getStatusBadge(delivery.deliveryStatus)}
            <span class="text-muted text-sm">${Utils.formatDateTime(delivery.assignedDate)}</span>
          </div>
        </div>
        <div class="delivery-card__body">
          <!-- Address -->
          <div class="delivery-card__address">
            <span class="delivery-card__address-icon">📍</span>
            <span>${order.deliveryAddress}</span>
          </div>

          <!-- Customer -->
          <div class="delivery-card__customer">
            <div class="avatar">${customer.name[0]}</div>
            <div class="delivery-card__customer-info">
              <div class="delivery-card__customer-name">${customer.name}</div>
              <div class="delivery-card__customer-phone">${customer.phone}</div>
            </div>
            <a href="tel:${customer.phone}" class="delivery-card__phone-btn" aria-label="Call ${customer.name}">📞</a>
          </div>

          <!-- Items -->
          <div class="delivery-card__items">
            ${order.items.map(item => {
              const p = DB.products.getById(item.productID);
              return p ? `<span class="order-item-chip">${p.emoji || ''} ${p.name} ×${item.quantity}</span>` : '';
            }).join('')}
          </div>

          <!-- Meta -->
          <div style="display:flex;gap:.75rem;flex-wrap:wrap;align-items:center;font-size:.8rem;color:var(--text-muted);">
            <span>🕐 ${order.deliverySlot}</span>
            ${order.paymentMethod === 'COD' ? `<span class="delivery-card__payment-badge">💵 COD: ${Utils.formatCurrency(order.totalAmount)}</span>` : '<span class="badge badge--success">✓ Paid Online</span>'}
          </div>
        </div>

        ${!isDone ? `
          <div class="delivery-card__footer">
            ${isAssigned ? `<button class="btn btn--secondary btn--sm" onclick="AgentApp.startDelivery('${delivery.deliveryID}')">🚀 Start Delivery</button>` : ''}
            ${isInTransit ? `
              <button class="btn btn--ghost btn--sm" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}','_blank')" aria-label="Open in maps">🗺 Maps</button>
              <button class="btn btn--primary btn--sm" onclick="AgentApp.confirmDelivered('${delivery.deliveryID}')">✅ Mark Delivered</button>
            ` : ''}
          </div>
        ` : `
          <div class="delivery-card__footer">
            <span class="text-muted text-sm">✅ Delivered: ${Utils.formatDateTime(delivery.completedDate)}</span>
          </div>
        `}
      </div>
    `;
  }

  /* ─── Delivery Actions ────────────────────────────────── */
  function startDelivery(deliveryId) {
    DB.deliveries.update(deliveryId, { deliveryStatus: 'In Transit' });
    const delivery = DB.deliveries.getById(deliveryId);
    const order = delivery ? DB.orders.getById(delivery.orderID) : null;
    if (order) {
      DB.orders.update(order.orderID, { deliveryStatus: 'Out for Delivery' });
      const customer = DB.customers.getById(order.customerID);
      if (customer) Utils.simulateSMS(customer.phone, `Your order ${order.orderID} is on its way! 🚚 Agent: ${currentAgent.name}`);
    }
    Utils.showToast('Delivery started! Drive safe 🚚', 'success');
    renderDeliveries();
  }

  function confirmDelivered(deliveryId) {
    document.getElementById('signature-input').value = '';
    document.getElementById('btn-confirm-delivered').onclick = () => {
      const sig = document.getElementById('signature-input').value.trim();
      if (!sig) { Utils.showToast('Please enter the customer name/signature.', 'warning'); return; }

      DB.deliveries.update(deliveryId, {
        deliveryStatus: 'Delivered',
        completedDate: new Date().toISOString(),
        customerSignature: sig
      });

      const delivery = DB.deliveries.getById(deliveryId);
      if (delivery) {
        const order = DB.orders.getById(delivery.orderID);
        if (order) {
          DB.orders.update(order.orderID, { deliveryStatus: 'Delivered', deliveryCompletedDate: new Date().toISOString() });
          if (order.paymentMethod === 'COD') {
            DB.payments.add({ orderID: order.orderID, amount: order.totalAmount, paymentMethod: 'COD', paymentStatus: 'Completed' });
            DB.orders.update(order.orderID, { paymentStatus: 'Completed' });
          }
          const customer = DB.customers.getById(order.customerID);
          if (customer) Utils.simulateSMS(customer.phone, `Order ${order.orderID} delivered! ✅ Please rate your experience in the app.`);
        }
      }

      Utils.hideModal('modal-delivered');
      Utils.showToast('Delivery confirmed! Great work! 🎉', 'success');
      currentAgent = DB.agents.getById(currentAgent.agentID); // refresh workload
      renderDeliveries();
    };
    Utils.showModal('modal-delivered');
  }

  /* ─── Location Modal ──────────────────────────────────── */
  function openLocationModal() {
    const agent = DB.agents.getById(currentAgent.agentID);
    document.getElementById('modal-location-body').innerHTML = `
      <div class="form__group">
        <label class="form__label" for="loc-area">Current Location <span>*</span></label>
        <select class="form__select" id="loc-area" aria-required="true">
          ${AREAS.map(a => `<option value="${a.v}" data-postal="${a.p}" ${a.v === agent.currentLocation ? 'selected' : ''}>${a.v}</option>`).join('')}
        </select>
        <span class="form__hint">Select your current delivery area. This is used for proximity-based order assignment.</span>
      </div>
      <div class="modal__footer" style="padding:0;border:none;background:none;margin-top:1.25rem;">
        <button class="btn btn--outline-gray" onclick="Utils.hideModal('modal-location')">Cancel</button>
        <button class="btn btn--primary" onclick="AgentApp.updateLocation()">📍 Update Location</button>
      </div>
    `;
    Utils.showModal('modal-location');
  }

  function updateLocation() {
    const areaEl = document.getElementById('loc-area');
    const area   = areaEl.value;
    const postal = areaEl.options[areaEl.selectedIndex]?.dataset?.postal || '00500';

    DB.agents.update(currentAgent.agentID, {
      currentLocation: area,
      area: area,
      postalCode: postal
    });
    currentAgent = DB.agents.getById(currentAgent.agentID);
    Utils.hideModal('modal-location');
    Utils.showToast(`Location updated to ${area}`, 'success');
    renderDashboard();
  }

  /* ─── VIEW: Performance ───────────────────────────────── */
  function renderPerformance() {
    const agent = DB.agents.getById(currentAgent.agentID);
    const allDeliveries = DB.deliveries.getByAgent(agent.agentID);
    const done = allDeliveries.filter(d => d.deliveryStatus === 'Delivered');
    const feedback = DB.feedback.getByAgent(agent.agentID);

    const thisMonth = new Date().getMonth();
    const thisYear  = new Date().getFullYear();
    const monthDone = done.filter(d => {
      const dt = new Date(d.completedDate || d.assignedDate);
      return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear;
    });

    const totalEarnings = done.length * 75; // LKR 75 per delivery
    const avgRating = feedback.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : agent.rating.toFixed(1);

    // Last 7 days delivery count
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      last7.push({ label: d.toLocaleDateString('en-GB', { day:'2-digit', month:'short' }), count: done.filter(dl => new Date(dl.completedDate || dl.assignedDate).toDateString() === ds).length });
    }
    const maxCount = Math.max(...last7.map(d => d.count), 1);

    document.getElementById('agent-content').innerHTML = `
      <div class="animate-fadeIn">
        <h2 style="margin-bottom:1.5rem;font-size:1.25rem;">⭐ My Performance</h2>

        <!-- Key Metrics -->
        <div class="perf-grid" style="margin-bottom:1.5rem;">
          <div class="perf-card">
            <div class="agent-stat__icon">📦</div>
            <div class="perf-card__value">${agent.totalDeliveries}</div>
            <div class="perf-card__label">Total Deliveries</div>
          </div>
          <div class="perf-card">
            <div class="agent-stat__icon">📅</div>
            <div class="perf-card__value">${monthDone.length}</div>
            <div class="perf-card__label">This Month</div>
          </div>
          <div class="perf-card">
            <div class="agent-stat__icon">💰</div>
            <div class="perf-card__value" style="font-size:1.5rem;">${Utils.formatCurrency(totalEarnings).replace('LKR ','')}</div>
            <div class="perf-card__label">Total Earnings</div>
          </div>
          <div class="perf-card">
            <div class="rating-large">
              <div class="rating-large__num">${avgRating}</div>
              <div class="rating-large__stars">${Utils.renderStars(parseFloat(avgRating))}</div>
              <div class="rating-large__count">${feedback.length} reviews</div>
            </div>
          </div>
        </div>

        <!-- Activity Chart (last 7 days) -->
        <div class="card mb-4">
          <div class="card__header"><span class="card__title">📈 Deliveries — Last 7 Days</span></div>
          <div class="card__body">
            <div class="bar-chart">
              ${last7.map(d => `<div class="bar-chart__bar" style="height:${Math.max(d.count/maxCount*100,4)}%" data-value="${d.count}" title="${d.label}: ${d.count} deliveries"></div>`).join('')}
            </div>
            <div class="bar-chart__labels">
              ${last7.map(d => `<div class="bar-chart__label">${d.label}</div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Recent Feedback -->
        <div class="card">
          <div class="card__header"><span class="card__title">💬 Customer Feedback</span></div>
          ${feedback.length === 0 ? `
            <div class="card__body">
              <div class="empty-state" style="padding:2rem 0;">
                <div class="empty-state__icon">💬</div>
                <div class="empty-state__title">No feedback yet</div>
                <div class="empty-state__desc">Customer reviews will appear here after deliveries.</div>
              </div>
            </div>
          ` : `
            <div>
              ${feedback.slice().reverse().slice(0, 10).map(fb => {
                const customer = DB.customers.getById(fb.customerID);
                return `
                  <div class="feedback-item">
                    <div class="feedback-item__header">
                      <div style="display:flex;align-items:center;gap:.5rem;">
                        <div class="avatar" style="width:28px;height:28px;font-size:.75rem;">${customer?.name[0] || 'C'}</div>
                        <div class="feedback-item__customer">${customer?.name || 'Customer'}</div>
                      </div>
                      <div style="display:flex;align-items:center;gap:.5rem;">
                        ${Utils.renderStars(fb.rating)}
                        <span class="feedback-item__date">${Utils.formatDate(fb.date)}</span>
                      </div>
                    </div>
                    ${fb.comments ? `<div class="feedback-item__comment">"${fb.comments}"</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Agent Profile Card -->
        <div class="card mt-4">
          <div class="card__header"><span class="card__title">👤 My Profile</span></div>
          <div class="card__body" style="display:grid;grid-template-columns:auto 1fr;gap:1.5rem;align-items:center;">
            <div class="avatar avatar--xl">${agent.name[0]}</div>
            <div>
              <div style="font-weight:700;font-size:1.1rem;">${agent.name}</div>
              <div class="text-muted text-sm">${agent.email}</div>
              <div class="text-muted text-sm">📞 ${agent.phone}</div>
              <div style="margin-top:.75rem;display:flex;gap:.5rem;flex-wrap:wrap;">
                ${Utils.getStatusBadge(agent.availabilityStatus)}
                <span class="badge badge--info">📍 ${agent.currentLocation}</span>
                <span class="badge badge--muted">Joined ${Utils.formatDate(agent.joinDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return {
    init, navigate,
    toggleStatus,
    startDelivery, confirmDelivered,
    openLocationModal, updateLocation
  };

})();
