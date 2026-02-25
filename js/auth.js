/**
 * Fresh Grocers - Authentication Module
 * Handles login, logout, registration, and session management
 */

const Auth = (() => {

  const SESSION_KEY  = 'fg_session';
  const REMEMBER_KEY = 'fg_remember';

  /* ─── Session Helpers ───────────────────────────────────── */

  function _saveSession(sessionData, rememberMe = false) {
    const payload = JSON.stringify(sessionData);
    sessionStorage.setItem(SESSION_KEY, payload);
    if (rememberMe) localStorage.setItem(REMEMBER_KEY, payload);
  }

  function _clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }

  function getCurrentUser() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(REMEMBER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function isAuthenticated() { return getCurrentUser() !== null; }

  /* ─── Login ─────────────────────────────────────────────── */

  function login(email, password, rememberMe = false) {
    if (!email || !password) return { success: false, error: 'Email and password are required.' };

    const emailLower = email.toLowerCase().trim();
    const hash = Utils.hashPassword(password);

    // Check customers
    const customer = DB.customers.getByEmail(emailLower);
    if (customer && customer.password === hash) {
      if (customer.status !== 'Active') return { success: false, error: 'Your account has been suspended. Please contact support.' };
      const session = { userID: customer.customerID, role: 'customer', name: customer.name, email: customer.email };
      _saveSession(session, rememberMe);
      return { success: true, role: 'customer', user: customer };
    }

    // Check agents
    const agent = DB.agents.getByEmail(emailLower);
    if (agent && agent.password === hash) {
      if (agent.status !== 'Active') return { success: false, error: 'Your account has been suspended. Please contact support.' };
      const session = { userID: agent.agentID, role: 'agent', name: agent.name, email: agent.email };
      _saveSession(session, rememberMe);
      return { success: true, role: 'agent', user: agent };
    }

    // Check admins
    const admin = DB.admins.getByEmail(emailLower);
    if (admin && admin.password === hash) {
      const session = { userID: admin.adminID, role: 'admin', name: admin.name, email: admin.email, adminRole: admin.role };
      _saveSession(session, rememberMe);
      return { success: true, role: 'admin', user: admin };
    }

    return { success: false, error: 'Invalid email or password. Please try again.' };
  }

  /* ─── Logout ────────────────────────────────────────────── */

  function logout() {
    _clearSession();
    window.location.href = 'index.html';
  }

  /* ─── Registration ──────────────────────────────────────── */

  function registerCustomer(data) {
    const { name, email, phone, password, address, postalCode, area } = data;

    // Validate
    if (!Utils.validateRequired(name))     return { success: false, field: 'name',     error: 'Full name is required.' };
    if (!Utils.validateEmail(email))       return { success: false, field: 'email',    error: 'Please enter a valid email address.' };
    if (!Utils.validatePhone(phone))       return { success: false, field: 'phone',    error: 'Phone must be in format +94XXXXXXXXX.' };
    if (!Utils.validatePassword(password)) return { success: false, field: 'password', error: 'Password must be at least 6 characters.' };
    if (!Utils.validateRequired(address))  return { success: false, field: 'address',  error: 'Delivery address is required.' };

    // Check for duplicate email
    if (DB.customers.getByEmail(email) || DB.agents.getByEmail(email) || DB.admins.getByEmail(email)) {
      return { success: false, field: 'email', error: 'This email address is already registered.' };
    }

    const customer = DB.customers.add({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: Utils.hashPassword(password),
      address: address.trim(),
      postalCode: postalCode || '00000',
      area: area || 'Colombo 1'
    });

    if (!customer) return { success: false, error: 'Registration failed. Please try again.' };

    // Auto-login after registration
    const session = { userID: customer.customerID, role: 'customer', name: customer.name, email: customer.email };
    _saveSession(session, false);

    Utils.simulateEmail(customer.email, 'Welcome to Fresh Grocers!',
      `Hi ${customer.name}, your account has been created. Email: ${customer.email}`
    );

    return { success: true, user: customer };
  }

  function registerAgent(data) {
    const { name, email, phone, password, area, postalCode } = data;

    if (!Utils.validateRequired(name))     return { success: false, field: 'name',  error: 'Full name is required.' };
    if (!Utils.validateEmail(email))       return { success: false, field: 'email', error: 'Please enter a valid email address.' };
    if (!Utils.validatePhone(phone))       return { success: false, field: 'phone', error: 'Phone must be in format +94XXXXXXXXX.' };
    if (!Utils.validatePassword(password)) return { success: false, field: 'password', error: 'Password must be at least 6 characters.' };

    if (DB.agents.getByEmail(email) || DB.customers.getByEmail(email) || DB.admins.getByEmail(email)) {
      return { success: false, field: 'email', error: 'This email address is already registered.' };
    }

    const agent = DB.agents.add({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: Utils.hashPassword(password),
      area: area || 'Colombo 1',
      currentLocation: area || 'Colombo 1',
      postalCode: postalCode || '00100'
    });

    if (!agent) return { success: false, error: 'Registration failed. Please try again.' };

    const session = { userID: agent.agentID, role: 'agent', name: agent.name, email: agent.email };
    _saveSession(session, false);
    return { success: true, user: agent };
  }

  /* ─── Route Guards ──────────────────────────────────────── */

  function requireCustomer() {
    const user = getCurrentUser();
    if (!user || user.role !== 'customer') { window.location.href = 'index.html'; return null; }
    return DB.customers.getById(user.userID);
  }

  function requireAgent() {
    const user = getCurrentUser();
    if (!user || user.role !== 'agent') { window.location.href = 'index.html'; return null; }
    return DB.agents.getById(user.userID);
  }

  function requireAdmin() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') { window.location.href = 'index.html'; return null; }
    return DB.admins.getById(user.userID);
  }

  function redirectIfLoggedIn() {
    const user = getCurrentUser();
    if (!user) return;
    const routes = { customer: 'customer.html', agent: 'agent.html', admin: 'admin.html' };
    window.location.href = routes[user.role] || 'index.html';
  }

  /* ─── Profile Update ────────────────────────────────────── */

  function updateCustomerProfile(customerId, updates) {
    const customer = DB.customers.getById(customerId);
    if (!customer) return { success: false, error: 'User not found.' };

    if (updates.password) {
      if (!Utils.validatePassword(updates.password)) return { success: false, error: 'Password must be at least 6 characters.' };
      updates.password = Utils.hashPassword(updates.password);
    }
    if (updates.email && updates.email !== customer.email) {
      if (!Utils.validateEmail(updates.email)) return { success: false, error: 'Invalid email.' };
      const existing = DB.customers.getByEmail(updates.email);
      if (existing && existing.customerID !== customerId) return { success: false, error: 'Email already in use.' };
    }

    DB.customers.update(customerId, updates);
    // Update session name if changed
    if (updates.name) {
      const session = getCurrentUser();
      if (session) {
        session.name = updates.name;
        _saveSession(session, !!localStorage.getItem(REMEMBER_KEY));
      }
    }
    return { success: true };
  }

  return {
    login, logout,
    registerCustomer, registerAgent,
    getCurrentUser, isAuthenticated,
    requireCustomer, requireAgent, requireAdmin,
    redirectIfLoggedIn,
    updateCustomerProfile
  };
})();
