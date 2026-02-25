/**
 * Fresh Grocers - Database Layer
 * localStorage-backed CRUD operations for all entities
 */

const DB = (() => {

  const KEYS = {
    customers:   'fg_customers',
    agents:      'fg_agents',
    admins:      'fg_admins',
    products:    'fg_products',
    orders:      'fg_orders',
    deliveries:  'fg_deliveries',
    feedback:    'fg_feedback',
    payments:    'fg_payments',
    initialized: 'fg_initialized'
  };

  /* ─── Core localStorage helpers ────────────────────────── */

  function _get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error(`DB._get error for key "${key}":`, e);
      return [];
    }
  }

  function _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`DB._set error for key "${key}":`, e);
      return false;
    }
  }

  /* ─── Initialise with sample data ──────────────────────── */

  function init(force = false) {
    if (!force && localStorage.getItem(KEYS.initialized)) return;
    if (typeof SAMPLE_DATA === 'undefined') {
      console.warn('SAMPLE_DATA not loaded — skipping seed');
      return;
    }
    _set(KEYS.customers,  SAMPLE_DATA.customers);
    _set(KEYS.agents,     SAMPLE_DATA.deliveryAgents);
    _set(KEYS.admins,     SAMPLE_DATA.administrators);
    _set(KEYS.products,   SAMPLE_DATA.products);
    _set(KEYS.orders,     SAMPLE_DATA.orders);
    _set(KEYS.deliveries, SAMPLE_DATA.deliveries);
    _set(KEYS.feedback,   SAMPLE_DATA.feedback);
    _set(KEYS.payments,   SAMPLE_DATA.payments);
    localStorage.setItem(KEYS.initialized, '1');
    console.log('Fresh Grocers DB initialised with sample data.');
  }

  function reset() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    init(true);
  }

  /* ─── Generic helpers ───────────────────────────────────── */

  function _findById(collection, idField, id) {
    return _get(collection).find(item => item[idField] === id) || null;
  }

  function _findByField(collection, field, value) {
    return _get(collection).filter(item => item[field] === value);
  }

  function _findOneByField(collection, field, value) {
    return _get(collection).find(item => item[field] === value) || null;
  }

  function _save(collection, item, idField) {
    const arr = _get(collection);
    const idx = arr.findIndex(i => i[idField] === item[idField]);
    if (idx >= 0) arr[idx] = { ...arr[idx], ...item };
    else arr.push(item);
    return _set(collection, arr);
  }

  function _remove(collection, idField, id) {
    const arr = _get(collection).filter(i => i[idField] !== id);
    return _set(collection, arr);
  }

  /* ─── Customers ─────────────────────────────────────────── */

  const customers = {
    getAll() { return _get(KEYS.customers); },
    getById(id) { return _findById(KEYS.customers, 'customerID', id); },
    getByEmail(email) { return _findOneByField(KEYS.customers, 'email', email.toLowerCase().trim()); },
    add(data) {
      const customer = {
        ...data,
        customerID: data.customerID || Utils.generateId('CUST'),
        email: data.email.toLowerCase().trim(),
        registrationDate: data.registrationDate || new Date().toISOString().split('T')[0],
        totalOrders: 0,
        status: 'Active'
      };
      return _save(KEYS.customers, customer, 'customerID') ? customer : null;
    },
    update(id, updates) {
      const customer = this.getById(id);
      if (!customer) return false;
      return _save(KEYS.customers, { ...customer, ...updates }, 'customerID');
    },
    remove(id) { return _remove(KEYS.customers, 'customerID', id); },
    search(query) {
      const q = query.toLowerCase();
      return this.getAll().filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      );
    }
  };

  /* ─── Delivery Agents ───────────────────────────────────── */

  const agents = {
    getAll() { return _get(KEYS.agents); },
    getById(id) { return _findById(KEYS.agents, 'agentID', id); },
    getByEmail(email) { return _findOneByField(KEYS.agents, 'email', email.toLowerCase().trim()); },
    getOnline() { return _findByField(KEYS.agents, 'availabilityStatus', 'Online'); },
    add(data) {
      const agent = {
        ...data,
        agentID: data.agentID || Utils.generateId('AGT'),
        email: data.email.toLowerCase().trim(),
        joinDate: data.joinDate || new Date().toISOString().split('T')[0],
        rating: data.rating || 0,
        totalDeliveries: 0,
        currentWorkload: 0,
        availabilityStatus: 'Offline',
        status: 'Active'
      };
      return _save(KEYS.agents, agent, 'agentID') ? agent : null;
    },
    update(id, updates) {
      const agent = this.getById(id);
      if (!agent) return false;
      return _save(KEYS.agents, { ...agent, ...updates }, 'agentID');
    },
    remove(id) { return _remove(KEYS.agents, 'agentID', id); },
    search(query) {
      const q = query.toLowerCase();
      return this.getAll().filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.includes(q)
      );
    }
  };

  /* ─── Administrators ────────────────────────────────────── */

  const admins = {
    getAll() { return _get(KEYS.admins); },
    getById(id) { return _findById(KEYS.admins, 'adminID', id); },
    getByEmail(email) { return _findOneByField(KEYS.admins, 'email', email.toLowerCase().trim()); }
  };

  /* ─── Products ──────────────────────────────────────────── */

  const products = {
    getAll() { return _get(KEYS.products); },
    getActive() { return this.getAll().filter(p => p.status === 'Active'); },
    getById(id) { return _findById(KEYS.products, 'productID', id); },
    getByCategory(cat) { return _findByField(KEYS.products, 'category', cat); },
    getCategories() { return [...new Set(this.getAll().map(p => p.category))].sort(); },
    getLowStock(threshold = 10) { return this.getAll().filter(p => p.stockQuantity <= threshold); },
    add(data) {
      const product = {
        ...data,
        productID: data.productID || Utils.generateId('PROD'),
        status: data.status || 'Active',
        popularity: data.popularity || 50
      };
      return _save(KEYS.products, product, 'productID') ? product : null;
    },
    update(id, updates) {
      const product = this.getById(id);
      if (!product) return false;
      return _save(KEYS.products, { ...product, ...updates }, 'productID');
    },
    remove(id) { return _remove(KEYS.products, 'productID', id); },
    decreaseStock(id, qty) {
      const p = this.getById(id);
      if (!p || p.stockQuantity < qty) return false;
      return this.update(id, { stockQuantity: p.stockQuantity - qty });
    },
    increaseStock(id, qty) {
      const p = this.getById(id);
      if (!p) return false;
      return this.update(id, { stockQuantity: p.stockQuantity + qty });
    },
    search(query) {
      const q = query.toLowerCase();
      return this.getActive().filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
  };

  /* ─── Orders ────────────────────────────────────────────── */

  const orders = {
    getAll() { return _get(KEYS.orders); },
    getById(id) { return _findById(KEYS.orders, 'orderID', id); },
    getByCustomer(customerId) { return _findByField(KEYS.orders, 'customerID', customerId); },
    getByAgent(agentId) { return _findByField(KEYS.orders, 'assignedAgentID', agentId); },
    getByStatus(status) { return _findByField(KEYS.orders, 'deliveryStatus', status); },
    getPending() {
      return this.getAll().filter(o =>
        ['Received', 'Processing'].includes(o.deliveryStatus) && !o.assignedAgentID
      );
    },
    getRecent(n = 10) {
      return this.getAll()
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice(0, n);
    },
    getTodaysOrders() {
      const today = new Date().toDateString();
      return this.getAll().filter(o => new Date(o.orderDate).toDateString() === today);
    },
    add(data) {
      const order = {
        ...data,
        orderID: data.orderID || Utils.generateOrderId(),
        orderDate: data.orderDate || new Date().toISOString(),
        deliveryStatus: 'Received',
        paymentStatus: data.paymentMethod === 'Online' ? 'Completed' : 'Pending',
        assignedAgentID: null,
        assignedDate: null,
        deliveryCompletedDate: null
      };
      if (_save(KEYS.orders, order, 'orderID')) {
        // Update customer total orders
        customers.update(order.customerID, {
          totalOrders: (customers.getById(order.customerID)?.totalOrders || 0) + 1
        });
        // Decrease product stock
        order.items.forEach(item => products.decreaseStock(item.productID, item.quantity));
        return order;
      }
      return null;
    },
    update(id, updates) {
      const order = this.getById(id);
      if (!order) return false;
      return _save(KEYS.orders, { ...order, ...updates }, 'orderID');
    },
    remove(id) { return _remove(KEYS.orders, 'orderID', id); },
    filter({ status, dateFrom, dateTo, paymentMethod, search } = {}) {
      let list = this.getAll();
      if (status && status !== 'All') list = list.filter(o => o.deliveryStatus === status);
      if (dateFrom) list = list.filter(o => new Date(o.orderDate) >= new Date(dateFrom));
      if (dateTo) list = list.filter(o => new Date(o.orderDate) <= new Date(dateTo + 'T23:59:59'));
      if (paymentMethod) list = list.filter(o => o.paymentMethod === paymentMethod);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(o => o.orderID.toLowerCase().includes(q) || o.deliveryAddress?.toLowerCase().includes(q));
      }
      return list.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }
  };

  /* ─── Deliveries ────────────────────────────────────────── */

  const deliveries = {
    getAll() { return _get(KEYS.deliveries); },
    getById(id) { return _findById(KEYS.deliveries, 'deliveryID', id); },
    getByOrder(orderId) { return _findOneByField(KEYS.deliveries, 'orderID', orderId); },
    getByAgent(agentId) { return _findByField(KEYS.deliveries, 'agentID', agentId); },
    getActiveByAgent(agentId) {
      return this.getByAgent(agentId).filter(d => d.deliveryStatus !== 'Delivered');
    },
    add(data) {
      const delivery = {
        ...data,
        deliveryID: data.deliveryID || Utils.generateId('DEL'),
        assignedDate: data.assignedDate || new Date().toISOString(),
        deliveryStatus: data.deliveryStatus || 'Assigned',
        completedDate: null,
        customerSignature: null
      };
      if (_save(KEYS.deliveries, delivery, 'deliveryID')) {
        // Update agent workload
        const agent = agents.getById(delivery.agentID);
        if (agent) agents.update(delivery.agentID, { currentWorkload: (agent.currentWorkload || 0) + 1 });
        return delivery;
      }
      return null;
    },
    update(id, updates) {
      const d = this.getById(id);
      if (!d) return false;
      const updated = { ...d, ...updates };
      // If being marked Delivered, update agent workload and total
      if (updates.deliveryStatus === 'Delivered' && d.deliveryStatus !== 'Delivered') {
        const agent = agents.getById(d.agentID);
        if (agent) {
          agents.update(d.agentID, {
            currentWorkload: Math.max(0, (agent.currentWorkload || 1) - 1),
            totalDeliveries: (agent.totalDeliveries || 0) + 1
          });
        }
      }
      return _save(KEYS.deliveries, updated, 'deliveryID');
    }
  };

  /* ─── Feedback ──────────────────────────────────────────── */

  const feedback = {
    getAll() { return _get(KEYS.feedback); },
    getById(id) { return _findById(KEYS.feedback, 'feedbackID', id); },
    getByOrder(orderId) { return _findOneByField(KEYS.feedback, 'orderID', orderId); },
    getByAgent(agentId) { return _findByField(KEYS.feedback, 'agentID', agentId); },
    getByCustomer(customerId) { return _findByField(KEYS.feedback, 'customerID', customerId); },
    add(data) {
      const fb = {
        ...data,
        feedbackID: data.feedbackID || Utils.generateId('FB'),
        date: data.date || new Date().toISOString()
      };
      if (_save(KEYS.feedback, fb, 'feedbackID')) {
        // Recalculate agent rating
        const agentFeedback = this.getByAgent(fb.agentID);
        if (agentFeedback.length > 0) {
          const avgRating = agentFeedback.reduce((sum, f) => sum + f.rating, 0) / agentFeedback.length;
          agents.update(fb.agentID, { rating: Math.round(avgRating * 10) / 10 });
        }
        return fb;
      }
      return null;
    }
  };

  /* ─── Payments ──────────────────────────────────────────── */

  const payments = {
    getAll() { return _get(KEYS.payments); },
    getById(id) { return _findById(KEYS.payments, 'paymentID', id); },
    getByOrder(orderId) { return _findOneByField(KEYS.payments, 'orderID', orderId); },
    add(data) {
      const payment = {
        ...data,
        paymentID: data.paymentID || Utils.generateId('PAY'),
        paymentDate: data.paymentDate || new Date().toISOString()
      };
      return _save(KEYS.payments, payment, 'paymentID') ? payment : null;
    },
    update(id, updates) {
      const p = this.getById(id);
      if (!p) return false;
      return _save(KEYS.payments, { ...p, ...updates }, 'paymentID');
    },
    getTodaysRevenue() {
      const today = new Date().toDateString();
      return this.getAll()
        .filter(p => p.paymentStatus === 'Completed' && new Date(p.paymentDate).toDateString() === today)
        .reduce((sum, p) => sum + p.amount, 0);
    }
  };

  /* ─── Analytics Helpers ─────────────────────────────────── */

  const analytics = {
    getRevenueByPeriod(days = 7) {
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const dayOrders = orders.getAll().filter(o =>
          new Date(o.orderDate).toDateString() === dateStr && o.paymentStatus === 'Completed'
        );
        result.push({
          date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
          count: dayOrders.length
        });
      }
      return result;
    },

    getTopProducts(n = 5) {
      const itemCounts = {};
      orders.getAll().forEach(order => {
        order.items.forEach(item => {
          if (!itemCounts[item.productID]) itemCounts[item.productID] = { qty: 0, revenue: 0 };
          itemCounts[item.productID].qty += item.quantity;
          itemCounts[item.productID].revenue += item.subtotal;
        });
      });
      return Object.entries(itemCounts)
        .map(([id, data]) => {
          const product = products.getById(id);
          return { product, ...data };
        })
        .filter(i => i.product)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, n);
    },

    getCategoryRevenue() {
      const catRevenue = {};
      orders.getAll().forEach(order => {
        order.items.forEach(item => {
          const product = products.getById(item.productID);
          if (product) {
            catRevenue[product.category] = (catRevenue[product.category] || 0) + item.subtotal;
          }
        });
      });
      return catRevenue;
    },

    getAgentPerformance() {
      return agents.getAll().map(agent => {
        const agentDeliveries = deliveries.getByAgent(agent.agentID);
        const completed = agentDeliveries.filter(d => d.deliveryStatus === 'Delivered');
        const agentFeedback = feedback.getByAgent(agent.agentID);
        const avgRating = agentFeedback.length
          ? agentFeedback.reduce((s, f) => s + f.rating, 0) / agentFeedback.length
          : agent.rating;
        return {
          ...agent,
          completedDeliveries: completed.length,
          avgRating: Math.round(avgRating * 10) / 10
        };
      });
    }
  };

  return { init, reset, customers, agents, admins, products, orders, deliveries, feedback, payments, analytics, KEYS };
})();
