/**
 * Fresh Grocers — Customer Portal SPA
 * Hash-based router + all customer views
 */

const CustomerApp = (() => {

  let currentUser = null;
  let cart = [];
  let checkoutStep = 1;
  let checkoutData = {};
  let selectedFilters = { category: 'All', maxPrice: 2000, inStockOnly: false, sort: 'popularity' };
  let searchQuery = '';

  const CART_KEY = () => `fg_cart_${currentUser?.userID}`;

  /* ─── Init ─────────────────────────────────────────────── */
  function init() {
    currentUser = Auth.requireCustomer();
    if (!currentUser) return;

    loadCart();
    updateCartBadge();
    updateNavUser();

    // Route on hash change
    window.addEventListener('hashchange', () => route(location.hash));
    // Nav search enter key
    const ns = document.getElementById('nav-search');
    if (ns) {
      ns.addEventListener('keydown', e => { if (e.key === 'Enter') handleNavSearch(); });
    }
    // Keyboard shortcut "/" focuses search
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        document.getElementById('nav-search')?.focus();
      }
    });
    // Close dropdown when clicking outside
    document.addEventListener('click', e => {
      if (!e.target.closest('.cust-nav__user')) closeUserMenu();
    });

    route(location.hash || '#home');
  }

  function route(hash) {
    const [base, param] = hash.replace('#', '').split('/');
    // Update active nav link
    ['home','products','orders'].forEach(id => {
      const el = document.getElementById(`nav-${id}`);
      if (el) el.classList.toggle('cust-nav__link--active', id === base);
    });
    Utils.scrollToTop(false);
    switch (base) {
      case 'products':    renderProducts(); break;
      case 'cart':        renderCart(); break;
      case 'checkout':    renderCheckout(); break;
      case 'orders':      renderOrders(); break;
      case 'order':       renderOrderDetail(param); break;
      case 'profile':     renderProfile(); break;
      default:            renderHome(); break;
    }
  }

  function navigate(view, param = '') {
    location.hash = param ? `${view}/${param}` : view;
  }

  /* ─── Nav Helpers ─────────────────────────────────────── */
  function updateNavUser() {
    const u = currentUser;
    const initial = u.name ? u.name[0].toUpperCase() : 'U';
    const av = document.getElementById('nav-avatar');
    const un = document.getElementById('nav-username');
    if (av) av.textContent = initial;
    if (un) un.textContent = u.name.split(' ')[0];
  }

  function updateCartBadge() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? '' : 'none';
    }
  }

  function toggleUserMenu() {
    const dd = document.getElementById('user-dropdown');
    const btn = document.getElementById('user-menu-btn');
    const isOpen = dd.classList.contains('open');
    dd.classList.toggle('open', !isOpen);
    btn?.setAttribute('aria-expanded', String(!isOpen));
  }

  function closeUserMenu() {
    document.getElementById('user-dropdown')?.classList.remove('open');
    document.getElementById('user-menu-btn')?.setAttribute('aria-expanded', 'false');
  }

  function toggleMobileMenu() {
    const m = document.getElementById('mobile-menu');
    if (m) m.style.display = m.style.display === 'none' ? 'flex' : 'none';
  }

  function closeMobileMenu() {
    const m = document.getElementById('mobile-menu');
    if (m) m.style.display = 'none';
  }

  function handleNavSearch() {
    const q = document.getElementById('nav-search')?.value.trim() || '';
    if (!q) return;
    selectedFilters = { ...selectedFilters, category: 'All' };
    searchQuery = q;
    navigate('products');
  }

  /* ─── Cart CRUD ───────────────────────────────────────── */
  function loadCart() {
    try { cart = JSON.parse(localStorage.getItem(CART_KEY()) || '[]'); }
    catch { cart = []; }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY(), JSON.stringify(cart));
    updateCartBadge();
  }

  function addToCart(productId, qty = 1) {
    const product = DB.products.getById(productId);
    if (!product) return;
    if (product.stockQuantity <= 0) { Utils.showToast('This item is out of stock.', 'warning'); return; }

    const existing = cart.find(i => i.productId === productId);
    if (existing) {
      const newQty = existing.qty + qty;
      if (newQty > product.stockQuantity) { Utils.showToast(`Only ${product.stockQuantity} units available.`, 'warning'); return; }
      existing.qty = newQty;
    } else {
      cart.push({ productId, qty: Math.min(qty, product.stockQuantity) });
    }

    saveCart();
    Utils.showToast(`${product.name} added to cart 🛒`, 'success', 2500);
  }

  function removeFromCart(productId) {
    cart = cart.filter(i => i.productId !== productId);
    saveCart();
  }

  function updateCartQty(productId, qty) {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;
    const product = DB.products.getById(productId);
    if (!product) return;
    if (qty <= 0) { removeFromCart(productId); return; }
    if (qty > product.stockQuantity) { Utils.showToast(`Only ${product.stockQuantity} available.`, 'warning'); qty = product.stockQuantity; }
    item.qty = qty;
    saveCart();
  }

  function getCartTotals() {
    let subtotal = 0;
    cart.forEach(item => {
      const p = DB.products.getById(item.productId);
      if (p) subtotal += p.price * item.qty;
    });
    const deliveryFee = subtotal > 0 ? 150 : 0;
    const tax = Math.round((subtotal + deliveryFee) * 0.05 * 100) / 100;
    return { subtotal, deliveryFee, tax, total: subtotal + deliveryFee + tax };
  }

  /* ─── VIEW: Home ──────────────────────────────────────── */
  function renderHome() {
    const content = document.getElementById('main-content');
    const featured = DB.products.getActive()
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8);
    const categories = DB.products.getCategories();

    content.innerHTML = `
      <!-- Hero -->
      <section class="hero">
        <div class="hero__inner">
          <div>
            <div class="hero__subtitle">🌿 Fresh &amp; Organic</div>
            <h1 class="hero__title">Sri Lanka's Freshest <span>Grocery</span> Delivery</h1>
            <p class="hero__desc">Order fresh produce, dairy, bakery essentials and household items delivered to your door in Colombo and beyond.</p>
            <div class="hero__actions">
              <button class="btn btn--primary btn--lg" onclick="CustomerApp.navigate('products')">Shop Now 🛒</button>
              <button class="btn btn--lg" style="background:rgba(255,255,255,.15);color:white;border:2px solid rgba(255,255,255,.4);" onclick="CustomerApp.navigate('orders')">My Orders</button>
            </div>
            <div class="hero__stats">
              <div>
                <div class="hero__stat-value">50+</div>
                <div class="hero__stat-label">Fresh Products</div>
              </div>
              <div>
                <div class="hero__stat-value">15+</div>
                <div class="hero__stat-label">Years Serving</div>
              </div>
              <div>
                <div class="hero__stat-value">5★</div>
                <div class="hero__stat-label">Customer Rating</div>
              </div>
            </div>
          </div>
          <div class="hero__image" aria-hidden="true">🛒</div>
        </div>
      </section>

      <!-- Categories -->
      <div class="container">
        <section class="section">
          <div class="section__header">
            <h2 class="section__title">Shop by Category</h2>
            <button class="section__link btn btn--ghost btn--sm" onclick="CustomerApp.navigate('products')">View All →</button>
          </div>
          <div class="category-grid" role="list">
            ${categories.map(cat => `
              <button class="category-card" role="listitem" onclick="CustomerApp.filterByCategory('${cat}')" aria-label="Browse ${cat}">
                <span class="category-card__emoji">${Utils.getCategoryEmoji(cat)}</span>
                <span class="category-card__name">${cat}</span>
              </button>
            `).join('')}
          </div>
        </section>

        <!-- Featured Products -->
        <section class="section">
          <div class="section__header">
            <h2 class="section__title">🔥 Popular This Week</h2>
            <button class="section__link btn btn--ghost btn--sm" onclick="CustomerApp.navigate('products')">See All →</button>
          </div>
          <div class="product-grid">
            ${featured.map(p => renderProductCard(p)).join('')}
          </div>
        </section>

        <!-- Value Props -->
        <section class="section">
          <div class="grid-3" style="margin-top:0;">
            ${[
              { icon: '🚚', title: 'Fast Delivery', desc: 'Delivered within 1-3 hours for Colombo orders.' },
              { icon: '🌿', title: 'Farm Fresh', desc: 'Products sourced directly from local farms daily.' },
              { icon: '🔒', title: 'Secure Payment', desc: 'Cash on delivery and secure online payments.' }
            ].map(v => `
              <div class="card p-5 text-center">
                <div style="font-size:2.5rem;margin-bottom:1rem;">${v.icon}</div>
                <h3 style="font-size:1rem;margin-bottom:.5rem;">${v.title}</h3>
                <p class="text-muted text-sm" style="margin:0;">${v.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>
      </div>

      <!-- Footer -->
      <footer class="cust-footer">
        <div class="container">
          <div class="cust-footer__grid">
            <div>
              <div style="font-size:1.5rem;font-weight:700;color:white;font-family:var(--font-heading);margin-bottom:.5rem;">🛒 Fresh Grocers</div>
              <p style="font-size:.875rem;line-height:1.7;margin-bottom:1rem;">Sri Lanka's trusted grocery delivery service, bringing freshness to your door since 2010.</p>
              <p style="font-size:.8rem;">📞 +94 11 234 5678 &nbsp;|&nbsp; 📧 hello@freshgrocers.lk</p>
            </div>
            <div>
              <div class="cust-footer__title">Shop</div>
              ${['Fruits & Vegetables','Dairy & Eggs','Bakery','Beverages','Household'].map(c =>
                `<a class="cust-footer__link" href="#">${c}</a>`
              ).join('')}
            </div>
            <div>
              <div class="cust-footer__title">Account</div>
              ${['My Profile','My Orders','Track Order','Feedback'].map(c =>
                `<a class="cust-footer__link" href="#">${c}</a>`
              ).join('')}
            </div>
            <div>
              <div class="cust-footer__title">Support</div>
              ${['Help Center','About Us','Privacy Policy','Terms of Service'].map(c =>
                `<a class="cust-footer__link" href="#">${c}</a>`
              ).join('')}
            </div>
          </div>
          <div class="cust-footer__bottom">&copy; 2025 Fresh Grocers (Pvt) Ltd. All rights reserved.</div>
        </div>
      </footer>
    `;

    // Bind qty controls on product cards
    bindProductCardActions();
  }

  /* ─── VIEW: Products ──────────────────────────────────── */
  function filterByCategory(cat) {
    selectedFilters.category = cat;
    searchQuery = '';
    navigate('products');
  }

  function renderProducts() {
    const allProducts = DB.products.getActive();
    const categories  = DB.products.getCategories();
    const maxPriceAll = Math.max(...allProducts.map(p => p.price), 2000);

    // Apply filters
    let list = allProducts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (selectedFilters.category && selectedFilters.category !== 'All') {
      list = list.filter(p => p.category === selectedFilters.category);
    }
    if (selectedFilters.inStockOnly) {
      list = list.filter(p => p.stockQuantity > 0);
    }
    list = list.filter(p => p.price <= selectedFilters.maxPrice);

    // Sort
    const sortMap = { popularity: (a,b) => b.popularity - a.popularity, 'price-asc': (a,b) => a.price - b.price, 'price-desc': (a,b) => b.price - a.price, name: (a,b) => a.name.localeCompare(b.name) };
    list = list.sort(sortMap[selectedFilters.sort] || sortMap.popularity);

    const catCounts = {};
    allProducts.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });

    document.getElementById('main-content').innerHTML = `
      <div class="container" style="padding-top:var(--space-6);padding-bottom:var(--space-8);">
        <!-- Breadcrumb -->
        <nav style="margin-bottom:1.5rem;font-size:.875rem;color:var(--text-muted);" aria-label="Breadcrumb">
          <button class="btn btn--ghost btn--sm" onclick="CustomerApp.navigate('home')" style="padding:0;color:var(--text-muted);">Home</button>
          <span style="margin:0 .5rem;">›</span>
          <span style="color:var(--text);">Shop</span>
          ${selectedFilters.category && selectedFilters.category !== 'All' ? `<span style="margin:0 .5rem;">›</span><span style="color:var(--primary);">${selectedFilters.category}</span>` : ''}
        </nav>

        <div class="products-layout">
          <!-- Filter Panel -->
          <aside class="filter-panel" aria-label="Product filters">
            <div class="filter-panel__title">
              <span>🔽 Filters</span>
              <button class="btn btn--ghost btn--sm" onclick="CustomerApp.clearFilters()">Clear</button>
            </div>

            <!-- Categories -->
            <div class="filter-panel__section">
              <div class="filter-panel__section-title">Category</div>
              <button class="filter-panel__cat-item ${selectedFilters.category === 'All' ? 'filter-panel__cat-item--active' : ''}"
                onclick="CustomerApp.setFilter('category','All')">
                All Products <span class="filter-panel__cat-count">${allProducts.length}</span>
              </button>
              ${categories.map(cat => `
                <button class="filter-panel__cat-item ${selectedFilters.category === cat ? 'filter-panel__cat-item--active' : ''}"
                  onclick="CustomerApp.setFilter('category','${cat}')">
                  ${Utils.getCategoryEmoji(cat)} ${cat}
                  <span class="filter-panel__cat-count">${catCounts[cat] || 0}</span>
                </button>
              `).join('')}
            </div>

            <!-- Price Range -->
            <div class="filter-panel__section">
              <div class="filter-panel__section-title">Max Price: ${Utils.formatCurrency(selectedFilters.maxPrice)}</div>
              <input class="form__range" type="range" min="50" max="${maxPriceAll}" step="50"
                value="${selectedFilters.maxPrice}" id="price-range"
                aria-label="Maximum price filter"
                oninput="document.getElementById('price-val').textContent=Utils.formatCurrency(this.value)"
                onchange="CustomerApp.setFilter('maxPrice', parseInt(this.value))">
              <div style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--text-muted);margin-top:.25rem;">
                <span>LKR 50</span>
                <span id="price-val">${Utils.formatCurrency(selectedFilters.maxPrice)}</span>
                <span>${Utils.formatCurrency(maxPriceAll)}</span>
              </div>
            </div>

            <!-- Stock -->
            <div class="filter-panel__section">
              <label class="form__check">
                <input type="checkbox" id="in-stock" ${selectedFilters.inStockOnly ? 'checked' : ''}
                  onchange="CustomerApp.setFilter('inStockOnly', this.checked)">
                <span class="form__check-label">In Stock Only</span>
              </label>
            </div>
          </aside>

          <!-- Products Area -->
          <div>
            <!-- Toolbar -->
            <div class="products-toolbar">
              <div class="products-toolbar__count">
                ${searchQuery ? `Results for "<strong>${searchQuery}</strong>": ` : ''}<strong>${list.length}</strong> products
                ${list.length === 0 && (searchQuery || selectedFilters.category !== 'All') ? `<button class="btn btn--ghost btn--sm" onclick="CustomerApp.clearFilters()">Clear filters</button>` : ''}
              </div>
              <div class="products-toolbar__sort">
                <label for="sort-select" style="font-size:.8rem;color:var(--text-muted);">Sort:</label>
                <select id="sort-select" onchange="CustomerApp.setFilter('sort', this.value)" aria-label="Sort products">
                  <option value="popularity" ${selectedFilters.sort === 'popularity' ? 'selected' : ''}>Most Popular</option>
                  <option value="price-asc" ${selectedFilters.sort === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                  <option value="price-desc" ${selectedFilters.sort === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                  <option value="name" ${selectedFilters.sort === 'name' ? 'selected' : ''}>Name A–Z</option>
                </select>
              </div>
            </div>

            <!-- Grid -->
            ${list.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state__icon">🔍</div>
                <div class="empty-state__title">No products found</div>
                <div class="empty-state__desc">Try adjusting your search or filters.</div>
                <button class="btn btn--primary" onclick="CustomerApp.clearFilters()">Clear Filters</button>
              </div>
            ` : `
              <div class="product-grid animate-fadeIn">
                ${list.map(p => renderProductCard(p)).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    bindProductCardActions();

    // Set search input value
    const ns = document.getElementById('nav-search');
    if (ns) ns.value = searchQuery;
  }

  function setFilter(key, value) {
    selectedFilters[key] = value;
    renderProducts();
  }

  function clearFilters() {
    selectedFilters = { category: 'All', maxPrice: 2000, inStockOnly: false, sort: 'popularity' };
    searchQuery = '';
    const ns = document.getElementById('nav-search');
    if (ns) ns.value = '';
    renderProducts();
  }

  /* ─── Product Card HTML ───────────────────────────────── */
  function renderProductCard(p) {
    const stockLabel = p.stockQuantity <= 0 ? 'Out of Stock' : p.stockQuantity <= 10 ? `Only ${p.stockQuantity} left` : 'In Stock';
    const stockClass = p.stockQuantity <= 0 ? 'product-card__stock--out' : p.stockQuantity <= 10 ? 'product-card__stock--low' : '';

    return `
      <article class="product-card" data-product-id="${p.productID}">
        <div class="product-card__img-wrap" onclick="CustomerApp.showProductDetail('${p.productID}')" role="button" tabindex="0" aria-label="View ${p.name} details">
          <div class="product-emoji product-emoji--${p.category}" aria-hidden="true">${p.emoji || Utils.getCategoryEmoji(p.category)}</div>
          ${p.stockQuantity <= 0 ? '<div class="product-card__badge"><span class="badge badge--danger">Out of Stock</span></div>' : ''}
          ${p.popularity >= 88 ? '<div class="product-card__badge"><span class="badge badge--warning">⭐ Popular</span></div>' : ''}
        </div>
        <div class="product-card__body">
          <div class="product-card__category">${p.category}</div>
          <h3 class="product-card__name">${p.name}</h3>
          <div class="product-card__stock ${stockClass}">${stockLabel}</div>
          <div class="product-card__price-row">
            <span class="product-card__price">${Utils.formatCurrency(p.price)}</span>
            <span class="product-card__unit">/ ${p.unit}</span>
          </div>
          <div class="product-card__actions">
            <div class="product-card__qty">
              <button class="product-card__qty-btn" data-action="dec" data-id="${p.productID}" aria-label="Decrease quantity">−</button>
              <input class="product-card__qty-input" type="number" min="1" max="${p.stockQuantity}" value="1" data-qty="${p.productID}" aria-label="Quantity">
              <button class="product-card__qty-btn" data-action="inc" data-id="${p.productID}" aria-label="Increase quantity">+</button>
            </div>
            <button class="btn btn--primary btn--sm flex-1" ${p.stockQuantity <= 0 ? 'disabled' : ''} data-add-to-cart="${p.productID}" aria-label="Add ${p.name} to cart">+ Cart</button>
          </div>
        </div>
      </article>
    `;
  }

  function bindProductCardActions() {
    document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.addToCart;
        const qtyEl = document.querySelector(`[data-qty="${id}"]`);
        const qty = qtyEl ? parseInt(qtyEl.value) || 1 : 1;
        addToCart(id, qty);
      });
    });

    document.querySelectorAll('[data-action="dec"],[data-action="inc"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const qtyEl = document.querySelector(`[data-qty="${id}"]`);
        if (!qtyEl) return;
        const product = DB.products.getById(id);
        let val = parseInt(qtyEl.value) || 1;
        if (btn.dataset.action === 'inc') val = Math.min(val + 1, product?.stockQuantity || 99);
        else val = Math.max(1, val - 1);
        qtyEl.value = val;
      });
    });
  }

  /* ─── Product Detail Modal ────────────────────────────── */
  function showProductDetail(productId) {
    const p = DB.products.getById(productId);
    if (!p) return;
    const cartItem = cart.find(i => i.productId === productId);

    document.getElementById('modal-product-title').textContent = p.name;
    document.getElementById('modal-product-body').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:start;">
        <div class="product-emoji product-emoji--${p.category}" style="border-radius:var(--radius-lg);font-size:6rem;aspect-ratio:1;" aria-hidden="true">${p.emoji || Utils.getCategoryEmoji(p.category)}</div>
        <div>
          <span class="badge badge--primary" style="margin-bottom:.75rem;">${p.category}</span>
          <h2 style="font-size:1.4rem;margin-bottom:.5rem;">${p.name}</h2>
          <p class="text-muted text-sm" style="margin-bottom:1rem;">${p.description}</p>
          <div style="font-size:1.75rem;font-weight:700;color:var(--primary-dark);font-family:var(--font-heading);margin-bottom:.25rem;">${Utils.formatCurrency(p.price)}</div>
          <div class="text-muted text-sm" style="margin-bottom:1rem;">Per ${p.unit}</div>
          <div style="margin-bottom:1.25rem;">${p.stockQuantity > 0 ? `<span style="color:var(--success);font-weight:600;">✓ ${p.stockQuantity} units in stock</span>` : '<span style="color:var(--danger);font-weight:600;">✕ Out of Stock</span>'}</div>
          <div style="display:flex;gap:.75rem;align-items:center;">
            <div class="product-card__qty">
              <button class="product-card__qty-btn" onclick="this.nextElementSibling.value=Math.max(1,parseInt(this.nextElementSibling.value)-1)" aria-label="Decrease">−</button>
              <input class="product-card__qty-input" type="number" id="detail-qty" min="1" max="${p.stockQuantity}" value="${cartItem ? cartItem.qty : 1}" aria-label="Quantity">
              <button class="product-card__qty-btn" onclick="this.previousElementSibling.value=Math.min(${p.stockQuantity},parseInt(this.previousElementSibling.value)+1)" aria-label="Increase">+</button>
            </div>
            <button class="btn btn--primary flex-1" ${p.stockQuantity <= 0 ? 'disabled' : ''} onclick="CustomerApp.addToCart('${p.productID}', parseInt(document.getElementById('detail-qty').value)||1); Utils.hideModal('modal-product');" aria-label="Add to cart">🛒 Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    Utils.showModal('modal-product');
  }

  /* ─── VIEW: Cart ──────────────────────────────────────── */
  function renderCart() {
    const totals = getCartTotals();
    const cartProducts = cart.map(item => {
      const p = DB.products.getById(item.productId);
      return p ? { ...item, product: p } : null;
    }).filter(Boolean);

    document.getElementById('main-content').innerHTML = `
      <div class="container" style="padding-top:var(--space-6);padding-bottom:var(--space-8);">
        <h1 style="margin-bottom:var(--space-5);">🛒 Shopping Cart <span style="font-size:1rem;font-weight:400;color:var(--text-muted);">(${cartProducts.length} items)</span></h1>

        ${cartProducts.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon">🛒</div>
            <div class="empty-state__title">Your cart is empty</div>
            <div class="empty-state__desc">Add some fresh groceries to get started!</div>
            <button class="btn btn--primary" onclick="CustomerApp.navigate('products')">Browse Products</button>
          </div>
        ` : `
          <div class="cart-layout">
            <!-- Items -->
            <div class="card">
              <div class="card__header">
                <span class="card__title">Cart Items</span>
                <button class="btn btn--danger-outline btn--sm" onclick="CustomerApp.clearCart()">Clear All</button>
              </div>
              <div class="card__body" style="padding:0;">
                ${cartProducts.map(item => `
                  <div class="cart-item" id="cart-row-${item.productId}">
                    <div class="cart-item__img product-emoji--${item.product.category}" style="border-radius:var(--radius);">${item.product.emoji || '🛒'}</div>
                    <div class="cart-item__info">
                      <div class="cart-item__name">${item.product.name}</div>
                      <div class="cart-item__unit">Unit price: ${Utils.formatCurrency(item.product.price)} / ${item.product.unit}</div>
                      <div class="cart-item__price">${Utils.formatCurrency(item.product.price * item.qty)}</div>
                    </div>
                    <div class="cart-item__qty">
                      <button class="cart-qty-btn" onclick="CustomerApp.changeCartQty('${item.productId}', -1)" aria-label="Decrease quantity">−</button>
                      <span class="cart-qty-val">${item.qty}</span>
                      <button class="cart-qty-btn" onclick="CustomerApp.changeCartQty('${item.productId}', 1)" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="cart-item__remove" onclick="CustomerApp.confirmRemove('${item.productId}')" aria-label="Remove ${item.product.name}">✕</button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Summary -->
            <div class="cart-summary">
              <div class="card__header"><span class="card__title">Order Summary</span></div>
              <div class="cart-summary__row"><span>Subtotal</span><span>${Utils.formatCurrency(totals.subtotal)}</span></div>
              <div class="cart-summary__row"><span>Delivery Fee</span><span>${Utils.formatCurrency(totals.deliveryFee)}</span></div>
              <div class="cart-summary__row"><span>Tax (5%)</span><span>${Utils.formatCurrency(totals.tax)}</span></div>
              <div class="cart-summary__row cart-summary__row--total"><span>Total</span><span>${Utils.formatCurrency(totals.total)}</span></div>
              <div style="padding:1rem 1.25rem;border-top:1px solid var(--gray-200);">
                <button class="btn btn--primary btn--full btn--lg" onclick="CustomerApp.navigate('checkout')">Proceed to Checkout →</button>
                <button class="btn btn--outline-gray btn--full mt-2" onclick="CustomerApp.navigate('products')">Continue Shopping</button>
              </div>
              <div style="padding:.75rem 1.25rem;background:var(--success-bg);font-size:.78rem;color:var(--success);font-weight:500;border-top:1px solid var(--gray-200);">
                ✓ Free delivery on orders over LKR 2,000
              </div>
            </div>
          </div>
        `}
      </div>
    `;
  }

  function changeCartQty(productId, delta) {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;
    updateCartQty(productId, item.qty + delta);
    renderCart();
  }

  function confirmRemove(productId) {
    const btn = document.getElementById('btn-confirm-remove');
    btn.onclick = () => {
      removeFromCart(productId);
      Utils.hideModal('modal-remove-confirm');
      renderCart();
      Utils.showToast('Item removed from cart.', 'info');
    };
    Utils.showModal('modal-remove-confirm');
  }

  function clearCart() {
    if (!confirm('Remove all items from your cart?')) return;
    cart = [];
    saveCart();
    renderCart();
  }

  /* ─── VIEW: Checkout ──────────────────────────────────── */
  function renderCheckout() {
    if (cart.length === 0) { navigate('cart'); return; }
    const totals = getCartTotals();

    const steps = [
      { num: 1, label: 'Delivery' },
      { num: 2, label: 'Payment' },
      { num: 3, label: 'Review' },
      { num: 4, label: 'Confirm' }
    ];

    document.getElementById('main-content').innerHTML = `
      <div class="container" style="padding-top:var(--space-6);padding-bottom:var(--space-8);">
        <h1 style="margin-bottom:var(--space-5);">Checkout</h1>

        <!-- Steps -->
        <div class="checkout-steps" role="list" aria-label="Checkout steps">
          ${steps.map(s => `
            <div class="checkout-step ${checkoutStep === s.num ? 'checkout-step--active' : ''} ${checkoutStep > s.num ? 'checkout-step--done' : ''}" role="listitem">
              <div class="checkout-step__num">${checkoutStep > s.num ? '✓' : s.num}</div>
              <div class="checkout-step__label">${s.label}</div>
            </div>
          `).join('')}
        </div>

        <div class="checkout-layout">
          <div id="checkout-main"></div>

          <!-- Summary Sidebar -->
          <div class="cart-summary">
            <div class="card__header"><span class="card__title">Order Summary</span></div>
            ${cart.map(item => {
              const p = DB.products.getById(item.productId);
              return p ? `<div class="cart-summary__row" style="font-size:.85rem;"><span>${p.name} × ${item.qty}</span><span>${Utils.formatCurrency(p.price * item.qty)}</span></div>` : '';
            }).join('')}
            <div class="cart-summary__row" style="border-top:1px dashed var(--gray-200);"><span>Subtotal</span><span>${Utils.formatCurrency(totals.subtotal)}</span></div>
            <div class="cart-summary__row"><span>Delivery</span><span>${Utils.formatCurrency(totals.deliveryFee)}</span></div>
            <div class="cart-summary__row"><span>Tax</span><span>${Utils.formatCurrency(totals.tax)}</span></div>
            <div class="cart-summary__row cart-summary__row--total"><span>Total</span><span>${Utils.formatCurrency(totals.total)}</span></div>
          </div>
        </div>
      </div>
    `;

    renderCheckoutStep();
  }

  function renderCheckoutStep() {
    const main = document.getElementById('checkout-main');
    if (!main) return;

    if (checkoutStep === 1) {
      main.innerHTML = `
        <div class="card">
          <div class="card__header"><span class="card__title">📍 Delivery Details</span></div>
          <div class="card__body">
            <div class="form__group">
              <label class="form__label" for="del-address">Delivery Address <span>*</span></label>
              <input class="form__input" type="text" id="del-address" value="${currentUser.address || ''}" placeholder="Full delivery address" required aria-required="true">
            </div>
            <div class="form__row">
              <div class="form__group">
                <label class="form__label" for="del-area">Area <span>*</span></label>
                <select class="form__select" id="del-area">
                  ${generateAreaOptions(currentUser.area)}
                </select>
              </div>
              <div class="form__group">
                <label class="form__label" for="del-postal">Postal Code</label>
                <input class="form__input" type="text" id="del-postal" value="${currentUser.postalCode || '00500'}" placeholder="00500">
              </div>
            </div>
            <div class="form__group">
              <label class="form__label">Delivery Time Slot <span>*</span></label>
              <div class="time-slots" role="radiogroup" aria-label="Delivery time slot">
                ${[
                  { id: 'morning', label: 'Morning', range: '8:00 AM – 12:00 PM', icon: '🌅' },
                  { id: 'afternoon', label: 'Afternoon', range: '12:00 PM – 4:00 PM', icon: '☀️' },
                  { id: 'evening', label: 'Evening', range: '4:00 PM – 8:00 PM', icon: '🌆' }
                ].map(s => `
                  <div class="time-slot ${checkoutData.slot === s.id ? 'selected' : ''}"
                    onclick="CustomerApp.selectSlot('${s.id}', this)" role="radio" aria-checked="${checkoutData.slot === s.id}" tabindex="0">
                    <div class="time-slot__icon">${s.icon}</div>
                    <div class="time-slot__label">${s.label}</div>
                    <div class="time-slot__range">${s.range}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="form__group">
              <label class="form__label" for="del-notes">Special Instructions (Optional)</label>
              <textarea class="form__textarea" id="del-notes" placeholder="E.g. Leave at gate, Call on arrival…" rows="2">${checkoutData.notes || ''}</textarea>
            </div>
            <button class="btn btn--primary btn--lg" onclick="CustomerApp.nextCheckoutStep()" style="width:100%;margin-top:.5rem;">Continue to Payment →</button>
          </div>
        </div>
      `;
    }

    else if (checkoutStep === 2) {
      main.innerHTML = `
        <div class="card">
          <div class="card__header"><span class="card__title">💳 Payment Method</span></div>
          <div class="card__body">
            <div class="payment-methods" role="radiogroup" aria-label="Payment method">
              <div class="payment-method ${checkoutData.payment === 'COD' ? 'selected' : ''}"
                onclick="CustomerApp.selectPayment('COD', this)" role="radio" aria-checked="${checkoutData.payment === 'COD'}" tabindex="0">
                <input type="radio" name="payment" value="COD" ${checkoutData.payment === 'COD' ? 'checked' : ''} aria-hidden="true">
                <div class="payment-method__icon">💵</div>
                <div>
                  <div class="payment-method__label">Cash on Delivery</div>
                  <div class="payment-method__desc">Pay with cash when your order arrives.</div>
                </div>
              </div>
              <div class="payment-method ${checkoutData.payment === 'Online' ? 'selected' : ''}"
                onclick="CustomerApp.selectPayment('Online', this)" role="radio" aria-checked="${checkoutData.payment === 'Online'}" tabindex="0">
                <input type="radio" name="payment" value="Online" ${checkoutData.payment === 'Online' ? 'checked' : ''} aria-hidden="true">
                <div class="payment-method__icon">💳</div>
                <div>
                  <div class="payment-method__label">Online Payment</div>
                  <div class="payment-method__desc">Visa, MasterCard, or bank transfer (secured).</div>
                </div>
              </div>
            </div>

            ${checkoutData.payment === 'Online' ? `
              <div class="card mt-4" style="border:2px solid var(--primary);">
                <div class="card__body">
                  <p class="text-sm text-muted mb-3">🔒 Secure payment simulation</p>
                  <div class="form__row">
                    <div class="form__group">
                      <label class="form__label">Card Number</label>
                      <input class="form__input" type="text" placeholder="1234 5678 9012 3456" maxlength="19">
                    </div>
                    <div class="form__group">
                      <label class="form__label">Card Holder</label>
                      <input class="form__input" type="text" placeholder="Name on card" value="${currentUser.name}">
                    </div>
                  </div>
                  <div class="form__row">
                    <div class="form__group">
                      <label class="form__label">Expiry</label>
                      <input class="form__input" type="text" placeholder="MM/YY" maxlength="5">
                    </div>
                    <div class="form__group">
                      <label class="form__label">CVV</label>
                      <input class="form__input" type="text" placeholder="123" maxlength="3">
                    </div>
                  </div>
                  <div class="alert alert--info text-sm">This is a simulation. No real payment is processed.</div>
                </div>
              </div>
            ` : ''}

            <div style="display:flex;gap:1rem;margin-top:1.5rem;">
              <button class="btn btn--outline-gray" onclick="CustomerApp.prevCheckoutStep()">← Back</button>
              <button class="btn btn--primary btn--lg flex-1" onclick="CustomerApp.nextCheckoutStep()">Review Order →</button>
            </div>
          </div>
        </div>
      `;
    }

    else if (checkoutStep === 3) {
      const totals = getCartTotals();
      const slotLabel = { morning: 'Morning (8–12)', afternoon: 'Afternoon (12–4)', evening: 'Evening (4–8)' };
      main.innerHTML = `
        <div class="card">
          <div class="card__header"><span class="card__title">📋 Review Your Order</span></div>
          <div class="card__body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
              <div class="card p-4">
                <div class="text-muted text-xs fw-600" style="text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem;">Delivery Details</div>
                <div style="font-size:.9rem;line-height:1.7;">${checkoutData.address || currentUser.address}<br>${checkoutData.area || currentUser.area}<br>🕐 ${slotLabel[checkoutData.slot] || '—'}</div>
              </div>
              <div class="card p-4">
                <div class="text-muted text-xs fw-600" style="text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem;">Payment</div>
                <div style="font-size:.9rem;">${checkoutData.payment === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment'}</div>
                <div class="text-muted text-sm mt-2">Total: <strong>${Utils.formatCurrency(totals.total)}</strong></div>
              </div>
            </div>

            <div class="table-wrapper">
              <table class="table table--compact">
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                <tbody>
                  ${cart.map(item => {
                    const p = DB.products.getById(item.productId);
                    return p ? `<tr><td>${p.emoji || ''} ${p.name}</td><td>${item.qty}</td><td>${Utils.formatCurrency(p.price)}</td><td>${Utils.formatCurrency(p.price * item.qty)}</td></tr>` : '';
                  }).join('')}
                  <tr class="total-row"><td colspan="3" style="font-weight:700;text-align:right;">Total</td><td style="font-weight:700;">${Utils.formatCurrency(totals.total)}</td></tr>
                </tbody>
              </table>
            </div>

            <div style="display:flex;gap:1rem;margin-top:1.5rem;">
              <button class="btn btn--outline-gray" onclick="CustomerApp.prevCheckoutStep()">← Back</button>
              <button class="btn btn--primary btn--lg flex-1" onclick="CustomerApp.placeOrder()">✅ Place Order</button>
            </div>
          </div>
        </div>
      `;
    }
  }

  function generateAreaOptions(selectedArea) {
    const areas = [
      { v: 'Colombo 1', p: '00100' }, { v: 'Colombo 2', p: '00200' }, { v: 'Colombo 3', p: '00300' },
      { v: 'Colombo 4', p: '00400' }, { v: 'Colombo 5', p: '00500' }, { v: 'Colombo 6', p: '00600' },
      { v: 'Colombo 7', p: '00700' }, { v: 'Colombo 10', p: '01000' }, { v: 'Colombo 12', p: '01200' },
      { v: 'Colombo 15', p: '01500' }, { v: 'Nugegoda', p: '10250' }, { v: 'Dehiwala', p: '10350' },
      { v: 'Ratmalana', p: '10390' }, { v: 'Moratuwa', p: '10400' }, { v: 'Gampaha', p: '11000' },
      { v: 'Negombo', p: '11500' }, { v: 'Kandy', p: '20000' }, { v: 'Galle', p: '80000' }
    ];
    return areas.map(a => `<option value="${a.v}" data-postal="${a.p}" ${a.v === selectedArea ? 'selected' : ''}>${a.v}</option>`).join('');
  }

  function selectSlot(slot, el) {
    checkoutData.slot = slot;
    document.querySelectorAll('.time-slot').forEach(s => { s.classList.remove('selected'); s.setAttribute('aria-checked', 'false'); });
    el.classList.add('selected');
    el.setAttribute('aria-checked', 'true');
  }

  function selectPayment(method, el) {
    checkoutData.payment = method;
    document.querySelectorAll('.payment-method').forEach(m => { m.classList.remove('selected'); m.setAttribute('aria-checked', 'false'); });
    el.classList.add('selected');
    el.setAttribute('aria-checked', 'true');
    renderCheckoutStep(); // re-render to show card form
  }

  function nextCheckoutStep() {
    if (checkoutStep === 1) {
      const addr = document.getElementById('del-address')?.value.trim();
      const areaEl = document.getElementById('del-area');
      if (!addr) { Utils.showToast('Please enter your delivery address.', 'warning'); return; }
      if (!checkoutData.slot) { Utils.showToast('Please select a delivery time slot.', 'warning'); return; }
      checkoutData.address = addr;
      checkoutData.area = areaEl?.value || currentUser.area;
      checkoutData.postalCode = areaEl?.options[areaEl?.selectedIndex]?.dataset?.postal || currentUser.postalCode;
      checkoutData.notes = document.getElementById('del-notes')?.value || '';
    }
    if (checkoutStep === 2) {
      if (!checkoutData.payment) { Utils.showToast('Please select a payment method.', 'warning'); return; }
    }
    checkoutStep = Math.min(checkoutStep + 1, 3);
    renderCheckout();
  }

  function prevCheckoutStep() {
    checkoutStep = Math.max(1, checkoutStep - 1);
    renderCheckout();
  }

  function placeOrder() {
    const totals = getCartTotals();
    const slotMap = { morning: 'Morning 8-12', afternoon: 'Afternoon 12-4', evening: 'Evening 4-8' };

    const orderData = {
      customerID: currentUser.customerID,
      items: cart.map(item => {
        const p = DB.products.getById(item.productId);
        return { productID: item.productId, quantity: item.qty, unitPrice: p.price, subtotal: p.price * item.qty };
      }),
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      tax: totals.tax,
      totalAmount: totals.total,
      deliveryAddress: checkoutData.address || currentUser.address,
      area: checkoutData.area || currentUser.area,
      postalCode: checkoutData.postalCode || currentUser.postalCode,
      deliverySlot: slotMap[checkoutData.slot] || 'Morning 8-12',
      paymentMethod: checkoutData.payment || 'COD',
      notes: checkoutData.notes
    };

    const btn = document.querySelector('#checkout-main .btn--primary:last-child');
    if (btn) Utils.setLoading(btn, true);

    setTimeout(() => {
      const order = DB.orders.add(orderData);
      if (!order) { Utils.showToast('Failed to place order. Please try again.', 'error'); if (btn) Utils.setLoading(btn, false); return; }

      // Create payment if online
      if (orderData.paymentMethod === 'Online') {
        DB.payments.add({ orderID: order.orderID, amount: totals.total, paymentMethod: 'Online', paymentStatus: 'Completed' });
      }

      // Clear cart
      cart = [];
      saveCart();
      checkoutStep = 1;
      checkoutData = {};

      // Notify
      Utils.simulateSMS(currentUser.phone, `Order ${order.orderID} confirmed! We'll notify you when it's assigned for delivery. Total: ${Utils.formatCurrency(totals.total)}`);

      // Render success
      document.getElementById('main-content').innerHTML = `
        <div class="container" style="padding:var(--space-10) 0;text-align:center;">
          <div style="font-size:5rem;margin-bottom:1.5rem;animation:bounce 1s ease;">🎉</div>
          <h1 style="color:var(--success);margin-bottom:.75rem;">Order Placed!</h1>
          <p class="text-muted" style="margin-bottom:1rem;">Your order has been confirmed. You'll receive an SMS notification when assigned to a delivery agent.</p>
          <div class="card mx-auto p-5" style="max-width:400px;margin-bottom:2rem;">
            <div style="font-family:var(--font-mono);font-size:1.2rem;font-weight:700;color:var(--blue-dark);margin-bottom:.5rem;">${order.orderID}</div>
            <div class="text-muted text-sm">Total: <strong>${Utils.formatCurrency(order.totalAmount)}</strong></div>
            <div class="text-muted text-sm">Slot: <strong>${order.deliverySlot}</strong></div>
            <div class="text-muted text-sm">Payment: <strong>${order.paymentMethod}</strong></div>
          </div>
          <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
            <button class="btn btn--primary" onclick="CustomerApp.navigate('orders')">Track My Order</button>
            <button class="btn btn--outline" onclick="CustomerApp.navigate('products')">Continue Shopping</button>
          </div>
        </div>
      `;
    }, 800);
  }

  /* ─── VIEW: Orders ────────────────────────────────────── */
  function renderOrders() {
    const orders = DB.orders.getByCustomer(currentUser.customerID)
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    document.getElementById('main-content').innerHTML = `
      <div class="container" style="padding-top:var(--space-6);padding-bottom:var(--space-8);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5);">
          <h1>📦 My Orders</h1>
          <button class="btn btn--primary" onclick="CustomerApp.navigate('products')">+ New Order</button>
        </div>

        ${orders.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon">📦</div>
            <div class="empty-state__title">No orders yet</div>
            <div class="empty-state__desc">Place your first order and get fresh groceries delivered!</div>
            <button class="btn btn--primary" onclick="CustomerApp.navigate('products')">Start Shopping</button>
          </div>
        ` : orders.map(order => {
          const agent = order.assignedAgentID ? DB.agents.getById(order.assignedAgentID) : null;
          const fb = DB.feedback.getByOrder(order.orderID);
          return `
            <div class="order-card animate-fadeIn">
              <div class="order-card__header">
                <div>
                  <div class="order-card__id">${order.orderID}</div>
                  <div class="order-card__date">${Utils.formatDateTime(order.orderDate)}</div>
                </div>
                <div style="display:flex;align-items:center;gap:1rem;">
                  ${Utils.getStatusBadge(order.deliveryStatus)}
                  <div class="order-card__total">${Utils.formatCurrency(order.totalAmount)}</div>
                </div>
              </div>
              <div class="order-card__body">
                <div class="order-items-preview">
                  ${order.items.map(item => {
                    const p = DB.products.getById(item.productID);
                    return p ? `<span class="order-item-chip">${p.emoji || ''} ${p.name} ×${item.quantity}</span>` : '';
                  }).join('')}
                </div>
                <!-- Progress Stepper -->
                <div class="stepper" aria-label="Order status">
                  ${['Received','Processing','Out for Delivery','Delivered'].map((s, i) => {
                    const statuses = ['Received','Processing','Out for Delivery','Delivered'];
                    const idx = statuses.indexOf(order.deliveryStatus);
                    const isDone = i < idx;
                    const isActive = i === idx;
                    return `<div class="stepper__item ${isDone ? 'stepper__item--done' : ''} ${isActive ? 'stepper__item--active' : ''}">
                      <div class="stepper__dot">${isDone ? '✓' : i + 1}</div>
                      <div class="stepper__label">${s}</div>
                    </div>`;
                  }).join('')}
                </div>
                ${agent ? `
                  <div class="agent-card mt-3">
                    <div class="avatar">${agent.name[0]}</div>
                    <div class="agent-card__info">
                      <div class="agent-card__name">Agent: ${agent.name}</div>
                      <div class="agent-card__phone">📞 ${agent.phone}</div>
                    </div>
                    ${Utils.renderStars(agent.rating)}
                  </div>
                ` : ''}
              </div>
              <div class="order-card__footer">
                <div style="display:flex;gap:.5rem;align-items:center;font-size:.8rem;color:var(--text-muted);">
                  ${Utils.getStatusBadge(order.paymentStatus)} ${order.paymentMethod}
                  &nbsp;· ${order.deliverySlot}
                </div>
                <div style="display:flex;gap:.5rem;">
                  <button class="btn btn--sm btn--outline" onclick="CustomerApp.navigate('order','${order.orderID}')">View Details</button>
                  ${order.deliveryStatus === 'Delivered' && !fb ? `<button class="btn btn--sm btn--primary" onclick="CustomerApp.openFeedback('${order.orderID}')">⭐ Rate</button>` : ''}
                  ${fb ? `<span class="badge badge--success">✓ Rated ${fb.rating}/5</span>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /* ─── VIEW: Order Detail ──────────────────────────────── */
  function renderOrderDetail(orderId) {
    const order = DB.orders.getById(orderId);
    if (!order) { navigate('orders'); return; }
    const agent = order.assignedAgentID ? DB.agents.getById(order.assignedAgentID) : null;

    document.getElementById('main-content').innerHTML = `
      <div class="container" style="padding-top:var(--space-5);padding-bottom:var(--space-8);">
        <nav style="margin-bottom:1.5rem;font-size:.875rem;color:var(--text-muted);">
          <button class="btn btn--ghost btn--sm" onclick="CustomerApp.navigate('orders')" style="padding:0;color:var(--text-muted);">← Back to Orders</button>
        </nav>

        <div style="display:grid;grid-template-columns:2fr 1fr;gap:1.5rem;align-items:start;">
          <div>
            <!-- Tracking Header -->
            <div class="tracking-header" style="margin-bottom:0;">
              <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:.5rem;">
                <div>
                  <div style="font-size:.8rem;opacity:.7;margin-bottom:.25rem;">Order ID</div>
                  <div style="font-family:var(--font-mono);font-size:1.2rem;font-weight:700;">${order.orderID}</div>
                  <div style="font-size:.8rem;opacity:.7;margin-top:.25rem;">${Utils.formatDateTime(order.orderDate)}</div>
                </div>
                ${Utils.getStatusBadge(order.deliveryStatus)}
              </div>
            </div>

            <!-- Stepper -->
            <div class="card" style="border-radius:0 0 var(--radius-lg) var(--radius-lg);border-top:none;margin-bottom:1.5rem;">
              <div class="card__body">
                <div class="stepper">
                  ${['Received','Processing','Out for Delivery','Delivered'].map((s, i) => {
                    const statuses = ['Received','Processing','Out for Delivery','Delivered'];
                    const idx = statuses.indexOf(order.deliveryStatus);
                    return `<div class="stepper__item ${i < idx ? 'stepper__item--done' : ''} ${i === idx ? 'stepper__item--active' : ''}">
                      <div class="stepper__dot">${i < idx ? '✓' : i + 1}</div>
                      <div class="stepper__label">${s}</div>
                    </div>`;
                  }).join('')}
                </div>
                ${agent ? `<div class="agent-card"><div class="avatar avatar--lg">${agent.name[0]}</div><div class="agent-card__info"><div class="agent-card__name">${agent.name}</div><div class="agent-card__phone">📞 ${agent.phone}</div></div>${Utils.renderStars(agent.rating)}</div>` : '<p class="text-muted text-sm mt-3 text-center">Delivery agent will be assigned soon.</p>'}
              </div>
            </div>

            <!-- Items Table -->
            <div class="card">
              <div class="card__header"><span class="card__title">Order Items</span></div>
              <div class="table-wrapper">
                <table class="table">
                  <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    ${order.items.map(item => {
                      const p = DB.products.getById(item.productID);
                      return `<tr><td>${p ? `${p.emoji || ''} ${p.name}` : item.productID}</td><td>${item.quantity}</td><td>${Utils.formatCurrency(item.unitPrice)}</td><td>${Utils.formatCurrency(item.subtotal)}</td></tr>`;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div>
            <div class="card mb-4">
              <div class="card__header"><span class="card__title">Order Summary</span></div>
              <div class="cart-summary__row"><span>Subtotal</span><span>${Utils.formatCurrency(order.subtotal)}</span></div>
              <div class="cart-summary__row"><span>Delivery</span><span>${Utils.formatCurrency(order.deliveryFee)}</span></div>
              <div class="cart-summary__row"><span>Tax</span><span>${Utils.formatCurrency(order.tax)}</span></div>
              <div class="cart-summary__row cart-summary__row--total"><span>Total</span><span>${Utils.formatCurrency(order.totalAmount)}</span></div>
            </div>
            <div class="card p-4">
              <div class="text-muted text-xs fw-600" style="text-transform:uppercase;letter-spacing:.05em;margin-bottom:.75rem;">Delivery Details</div>
              <p class="text-sm" style="line-height:1.7;">📍 ${order.deliveryAddress}<br>🕐 ${order.deliverySlot}<br>💳 ${order.paymentMethod} — ${Utils.getStatusBadge(order.paymentStatus)}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ─── VIEW: Profile ───────────────────────────────────── */
  function renderProfile() {
    const user = DB.customers.getById(currentUser.customerID);

    document.getElementById('main-content').innerHTML = `
      <div class="container" style="padding-top:var(--space-6);padding-bottom:var(--space-8);">
        <h1 style="margin-bottom:var(--space-5);">👤 My Profile</h1>
        <div class="profile-layout">
          <div class="profile-sidebar">
            <div class="profile-sidebar__header">
              <div class="avatar avatar--xl mx-auto mb-3">${user.name[0]}</div>
              <div style="font-weight:700;font-size:1.05rem;">${user.name}</div>
              <div style="font-size:.8rem;opacity:.8;margin-top:.25rem;">${user.email}</div>
              <div style="margin-top:.75rem;">${Utils.getStatusBadge(user.status)}</div>
            </div>
            <button class="profile-sidebar__nav-item profile-sidebar__nav-item--active">👤 Personal Info</button>
            <button class="profile-sidebar__nav-item" onclick="CustomerApp.navigate('orders')">📦 My Orders (${user.totalOrders})</button>
          </div>

          <div class="card">
            <div class="card__header"><span class="card__title">Personal Information</span></div>
            <div class="card__body">
              <form id="form-profile" novalidate>
                <div class="form__row">
                  <div class="form__group">
                    <label class="form__label" for="prof-name">Full Name</label>
                    <input class="form__input" type="text" id="prof-name" value="${user.name || ''}">
                  </div>
                  <div class="form__group">
                    <label class="form__label" for="prof-phone">Phone Number</label>
                    <input class="form__input" type="tel" id="prof-phone" value="${user.phone || ''}">
                  </div>
                </div>
                <div class="form__group">
                  <label class="form__label" for="prof-email">Email Address</label>
                  <input class="form__input" type="email" id="prof-email" value="${user.email || ''}">
                </div>
                <div class="form__group">
                  <label class="form__label" for="prof-address">Delivery Address</label>
                  <input class="form__input" type="text" id="prof-address" value="${user.address || ''}">
                </div>
                <div class="form__row">
                  <div class="form__group">
                    <label class="form__label" for="prof-area">Area</label>
                    <select class="form__select" id="prof-area">${generateAreaOptions(user.area)}</select>
                  </div>
                  <div class="form__group">
                    <label class="form__label" for="prof-postal">Postal Code</label>
                    <input class="form__input" type="text" id="prof-postal" value="${user.postalCode || ''}">
                  </div>
                </div>
                <div class="divider--text divider mt-4 mb-4">Change Password (optional)</div>
                <div class="form__row">
                  <div class="form__group">
                    <label class="form__label" for="prof-pw">New Password</label>
                    <input class="form__input" type="password" id="prof-pw" placeholder="Leave blank to keep current">
                  </div>
                  <div class="form__group">
                    <label class="form__label" for="prof-pw2">Confirm Password</label>
                    <input class="form__input" type="password" id="prof-pw2" placeholder="Repeat new password">
                  </div>
                </div>
                <div style="display:flex;gap:1rem;margin-top:1rem;">
                  <button type="submit" class="btn btn--primary">💾 Save Changes</button>
                  <button type="button" class="btn btn--outline-gray" onclick="CustomerApp.navigate('home')">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('form-profile').addEventListener('submit', e => {
      e.preventDefault();
      const pw  = document.getElementById('prof-pw').value;
      const pw2 = document.getElementById('prof-pw2').value;
      if (pw && pw !== pw2) { Utils.showToast('Passwords do not match.', 'error'); return; }

      const areaEl = document.getElementById('prof-area');
      const updates = {
        name:       document.getElementById('prof-name').value.trim(),
        phone:      document.getElementById('prof-phone').value.trim(),
        email:      document.getElementById('prof-email').value.trim(),
        address:    document.getElementById('prof-address').value.trim(),
        area:       areaEl.value,
        postalCode: areaEl.options[areaEl.selectedIndex]?.dataset?.postal || user.postalCode
      };
      if (pw) updates.password = pw;

      const result = Auth.updateCustomerProfile(currentUser.customerID, updates);
      if (result.success) {
        currentUser = Auth.getCurrentUser();
        Utils.showToast('Profile updated successfully!', 'success');
        updateNavUser();
      } else {
        Utils.showToast(result.error || 'Update failed.', 'error');
      }
    });
  }

  /* ─── Feedback Modal ──────────────────────────────────── */
  function openFeedback(orderId) {
    const order = DB.orders.getById(orderId);
    if (!order) return;
    const agent = order.assignedAgentID ? DB.agents.getById(order.assignedAgentID) : null;

    document.getElementById('modal-feedback-body').innerHTML = `
      <form id="form-feedback" novalidate>
        ${agent ? `<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;padding:1rem;background:var(--gray-50);border-radius:var(--radius);"><div class="avatar">${agent.name[0]}</div><div><div style="font-weight:600;">${agent.name}</div><div class="text-muted text-sm">Delivery Agent</div></div></div>` : ''}
        <div class="form__group">
          <label class="form__label">Your Rating <span>*</span></label>
          <div class="star-input" id="star-rating" role="group" aria-label="Rating">
            ${[5,4,3,2,1].map(n => `
              <input type="radio" name="rating" id="star${n}" value="${n}" ${n === 5 ? 'checked' : ''}>
              <label for="star${n}" title="${n} stars" aria-label="${n} star${n>1?'s':''}">★</label>
            `).join('')}
          </div>
        </div>
        <div class="form__group">
          <label class="form__label" for="fb-comment">Comments (Optional)</label>
          <textarea class="form__textarea" id="fb-comment" placeholder="Tell us about your experience…" rows="3"></textarea>
        </div>
        <div style="display:flex;gap:.75rem;margin-top:1rem;">
          <button type="button" class="btn btn--outline-gray flex-1" onclick="Utils.hideModal('modal-feedback')">Skip</button>
          <button type="submit" class="btn btn--primary flex-1">Submit Feedback</button>
        </div>
      </form>
    `;

    document.getElementById('form-feedback').addEventListener('submit', e => {
      e.preventDefault();
      const rating  = parseInt(document.querySelector('input[name="rating"]:checked')?.value || 5);
      const comment = document.getElementById('fb-comment').value.trim();
      DB.feedback.add({ customerID: currentUser.customerID, agentID: order.assignedAgentID, orderID: orderId, rating, comments: comment });
      Utils.hideModal('modal-feedback');
      Utils.showToast('Thank you for your feedback! ⭐', 'success');
      renderOrders();
    });

    Utils.showModal('modal-feedback');
  }

  return {
    init, navigate, route,
    addToCart, removeFromCart, updateCartQty,
    filterByCategory, setFilter, clearFilters,
    showProductDetail,
    changeCartQty, confirmRemove, clearCart,
    selectSlot, selectPayment,
    nextCheckoutStep, prevCheckoutStep,
    placeOrder,
    openFeedback,
    handleNavSearch,
    toggleUserMenu, closeUserMenu,
    toggleMobileMenu, closeMobileMenu
  };

})();
