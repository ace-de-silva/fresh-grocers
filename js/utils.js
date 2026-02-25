/**
 * Fresh Grocers - Utility Functions
 * Shared helper functions used across all portals
 */

const Utils = {

  /* ─── Formatting ─────────────────────────────────────────── */

  formatCurrency(amount) {
    return `LKR ${parseFloat(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  },

  formatTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  },

  timeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  },

  truncate(text, length = 60) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '…' : text;
  },

  /* ─── ID Generation ──────────────────────────────────────── */

  generateId(prefix = 'ID') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  },

  generateOrderId() {
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 90000) + 10000);
    return `FG-${year}-${num}`;
  },

  /* ─── Security ───────────────────────────────────────────── */

  hashPassword(password) {
    // NOTE: btoa is used for simulation only. Use bcrypt/argon2 in production.
    return btoa(password);
  },

  checkPassword(plaintext, hash) {
    return btoa(plaintext) === hash;
  },

  /* ─── Validation ─────────────────────────────────────────── */

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  },

  validatePhone(phone) {
    return /^\+94[0-9]{9}$/.test(phone.trim());
  },

  validatePassword(password) {
    return password && password.length >= 6;
  },

  validateRequired(value) {
    return value !== null && value !== undefined && String(value).trim() !== '';
  },

  /* ─── Toast Notifications ────────────────────────────────── */

  _toastContainer: null,

  _getToastContainer() {
    if (!this._toastContainer) {
      this._toastContainer = document.getElementById('toast-container');
      if (!this._toastContainer) {
        this._toastContainer = document.createElement('div');
        this._toastContainer.id = 'toast-container';
        this._toastContainer.setAttribute('aria-live', 'polite');
        this._toastContainer.setAttribute('aria-atomic', 'false');
        document.body.appendChild(this._toastContainer);
      }
    }
    return this._toastContainer;
  },

  showToast(message, type = 'info', duration = 4000) {
    const container = this._getToastContainer();
    const id = `toast-${Date.now()}`;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.id = id;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || icons.info}</span>
      <span class="toast__msg">${message}</span>
      <button class="toast__close" onclick="Utils.dismissToast('${id}')" aria-label="Close">&times;</button>
    `;
    container.appendChild(toast);

    // Trigger reflow for animation
    requestAnimationFrame(() => toast.classList.add('toast--show'));

    if (duration > 0) {
      setTimeout(() => this.dismissToast(id), duration);
    }
    return id;
  },

  dismissToast(id) {
    const toast = document.getElementById(id);
    if (toast) {
      toast.classList.remove('toast--show');
      toast.classList.add('toast--hide');
      setTimeout(() => toast.remove(), 300);
    }
  },

  /* ─── Modal ──────────────────────────────────────────────── */

  showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('modal--open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // Focus first focusable element
      const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) setTimeout(() => focusable.focus(), 100);
    }
  },

  hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('modal--open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  },

  /* ─── Status Helpers ─────────────────────────────────────── */

  getStatusBadge(status) {
    const map = {
      'Received':        { cls: 'badge--info',    label: 'Received' },
      'Processing':      { cls: 'badge--warning',  label: 'Processing' },
      'Out for Delivery':{ cls: 'badge--orange',   label: 'Out for Delivery' },
      'Delivered':       { cls: 'badge--success',  label: 'Delivered' },
      'Cancelled':       { cls: 'badge--danger',   label: 'Cancelled' },
      'Online':          { cls: 'badge--success',  label: 'Online' },
      'Offline':         { cls: 'badge--muted',    label: 'Offline' },
      'Active':          { cls: 'badge--success',  label: 'Active' },
      'Inactive':        { cls: 'badge--muted',    label: 'Inactive' },
      'Pending':         { cls: 'badge--warning',  label: 'Pending' },
      'Completed':       { cls: 'badge--success',  label: 'Completed' },
      'In Transit':      { cls: 'badge--orange',   label: 'In Transit' },
      'Assigned':        { cls: 'badge--info',     label: 'Assigned' }
    };
    const s = map[status] || { cls: 'badge--muted', label: status || 'Unknown' };
    return `<span class="badge ${s.cls}">${s.label}</span>`;
  },

  renderStars(rating, max = 5) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let html = '';
    for (let i = 1; i <= max; i++) {
      if (i <= full) html += '<span class="star star--full">★</span>';
      else if (i === full + 1 && half) html += '<span class="star star--half">★</span>';
      else html += '<span class="star star--empty">☆</span>';
    }
    return `<span class="stars" title="${rating.toFixed(1)} / ${max}">${html}</span>`;
  },

  /* ─── DOM Helpers ────────────────────────────────────────── */

  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  setLoading(buttonEl, isLoading, originalText = null) {
    if (!buttonEl) return;
    if (isLoading) {
      buttonEl._originalText = buttonEl.innerHTML;
      buttonEl.innerHTML = '<span class="spinner-sm"></span> Loading…';
      buttonEl.disabled = true;
    } else {
      buttonEl.innerHTML = originalText || buttonEl._originalText || 'Submit';
      buttonEl.disabled = false;
    }
  },

  showFormError(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('input--error');
    const errId = `err-${inputEl.id || inputEl.name}`;
    let errEl = document.getElementById(errId);
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.id = errId;
      errEl.className = 'form__error';
      errEl.setAttribute('role', 'alert');
      inputEl.insertAdjacentElement('afterend', errEl);
    }
    errEl.textContent = message;
    inputEl.setAttribute('aria-describedby', errId);
  },

  clearFormError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('input--error');
    const errId = `err-${inputEl.id || inputEl.name}`;
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = '';
  },

  clearAllFormErrors(formEl) {
    if (!formEl) return;
    formEl.querySelectorAll('.input--error').forEach(el => el.classList.remove('input--error'));
    formEl.querySelectorAll('.form__error').forEach(el => { el.textContent = ''; });
  },

  /* ─── Scroll ─────────────────────────────────────────────── */

  scrollToTop(smooth = true) {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  },

  scrollToElement(selector) {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  /* ─── Data Helpers ───────────────────────────────────────── */

  sortBy(arr, key, direction = 'asc') {
    return [...arr].sort((a, b) => {
      const av = a[key], bv = b[key];
      if (av < bv) return direction === 'asc' ? -1 : 1;
      if (av > bv) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      const group = item[key] || 'Other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});
  },

  sumBy(arr, key) {
    return arr.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
  },

  paginateArray(arr, page = 1, perPage = 10) {
    const start = (page - 1) * perPage;
    return {
      data: arr.slice(start, start + perPage),
      total: arr.length,
      page,
      perPage,
      totalPages: Math.ceil(arr.length / perPage)
    };
  },

  renderPagination(container, pagination, onPageChange) {
    if (!container) return;
    const { page, totalPages } = pagination;
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '<nav class="pagination" aria-label="Pagination"><ul class="pagination__list">';
    html += `<li><button class="pagination__btn" ${page === 1 ? 'disabled' : ''} data-page="${page - 1}" aria-label="Previous">‹</button></li>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<li><button class="pagination__btn ${i === page ? 'pagination__btn--active' : ''}" data-page="${i}" aria-current="${i === page ? 'page' : 'false'}">${i}</button></li>`;
    }
    html += `<li><button class="pagination__btn" ${page === totalPages ? 'disabled' : ''} data-page="${page + 1}" aria-label="Next">›</button></li>`;
    html += '</ul></nav>';
    container.innerHTML = html;

    container.querySelectorAll('.pagination__btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => onPageChange(parseInt(btn.dataset.page)));
    });
  },

  /* ─── Export Simulation ──────────────────────────────────── */

  exportCSV(data, filename = 'export.csv') {
    if (!data || !data.length) {
      this.showToast('No data to export', 'warning');
      return;
    }
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    this.showToast(`Exported ${data.length} records`, 'success');
  },

  /* ─── Simulated SMS / Notification ──────────────────────── */

  simulateSMS(phone, message) {
    console.log(`[SMS to ${phone}]: ${message}`);
    this.showToast(`📱 SMS sent to ${phone}: "${this.truncate(message, 50)}"`, 'info', 5000);
  },

  simulateEmail(email, subject, body) {
    console.log(`[EMAIL to ${email}] Subject: ${subject}\n${body}`);
    this.showToast(`📧 Email sent to ${email}`, 'info', 3000);
  },

  /* ─── Category Icons ─────────────────────────────────────── */

  getCategoryEmoji(category) {
    const map = {
      'Fruits': '🍎',
      'Vegetables': '🥦',
      'Dairy': '🥛',
      'Bakery': '🍞',
      'Beverages': '🥤',
      'Snacks': '🍿',
      'Frozen': '❄️',
      'Household': '🧹'
    };
    return map[category] || '🛒';
  }
};
