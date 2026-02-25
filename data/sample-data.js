/**
 * Fresh Grocers - Sample Seed Data
 * Pre-loaded data for demo and development purposes
 */

const SAMPLE_DATA = {

  customers: [
    {
      customerID: 'CUST001',
      name: 'Kasun Perera',
      email: 'demo.customer@freshgrocers.lk',
      phone: '+94771234567',
      password: btoa('customer123'),
      address: '23, Galle Road, Colombo 03',
      postalCode: '00300',
      area: 'Colombo 3',
      registrationDate: '2024-06-15',
      totalOrders: 12,
      status: 'Active'
    },
    {
      customerID: 'CUST002',
      name: 'Nimal Kumara',
      email: 'nimal.k@gmail.com',
      phone: '+94712345678',
      password: btoa('password123'),
      address: '45, Station Road, Colombo 05',
      postalCode: '00500',
      area: 'Colombo 5',
      registrationDate: '2024-07-22',
      totalOrders: 8,
      status: 'Active'
    },
    {
      customerID: 'CUST003',
      name: 'Sandya Perera',
      email: 'sandya.perera@gmail.com',
      phone: '+94777654321',
      password: btoa('password123'),
      address: '12, High Level Road, Nugegoda',
      postalCode: '10250',
      area: 'Nugegoda',
      registrationDate: '2024-08-05',
      totalOrders: 15,
      status: 'Active'
    },
    {
      customerID: 'CUST004',
      name: 'Priya Jayaweera',
      email: 'priya.jayaweera@gmail.com',
      phone: '+94765432109',
      password: btoa('password123'),
      address: '78, Beach Road, Dehiwala',
      postalCode: '10350',
      area: 'Dehiwala',
      registrationDate: '2024-08-18',
      totalOrders: 5,
      status: 'Active'
    },
    {
      customerID: 'CUST005',
      name: 'Chamara Mendis',
      email: 'chamara.mendis@gmail.com',
      phone: '+94754321098',
      password: btoa('password123'),
      address: '56, Main Street, Gampaha',
      postalCode: '11000',
      area: 'Gampaha',
      registrationDate: '2024-09-01',
      totalOrders: 3,
      status: 'Active'
    },
    {
      customerID: 'CUST006',
      name: 'Malini Fernando',
      email: 'malini.f@gmail.com',
      phone: '+94743210987',
      password: btoa('password123'),
      address: '34, Rosmead Place, Colombo 07',
      postalCode: '00700',
      area: 'Colombo 7',
      registrationDate: '2024-09-14',
      totalOrders: 20,
      status: 'Active'
    },
    {
      customerID: 'CUST007',
      name: 'Suresh Ranatunga',
      email: 'suresh.ranatunge@gmail.com',
      phone: '+94732109876',
      password: btoa('password123'),
      address: '89, Bauddhaloka Mawatha, Colombo 04',
      postalCode: '00400',
      area: 'Colombo 4',
      registrationDate: '2024-10-02',
      totalOrders: 7,
      status: 'Active'
    },
    {
      customerID: 'CUST008',
      name: 'Dinesh Wickrama',
      email: 'dinesh.w@gmail.com',
      phone: '+94721098765',
      password: btoa('password123'),
      address: '23, Katubedda Road, Moratuwa',
      postalCode: '10400',
      area: 'Moratuwa',
      registrationDate: '2024-10-20',
      totalOrders: 9,
      status: 'Active'
    },
    {
      customerID: 'CUST009',
      name: 'Amara Silva',
      email: 'amara.silva@gmail.com',
      phone: '+94710987654',
      password: btoa('password123'),
      address: '67, Maradana Road, Colombo 10',
      postalCode: '01000',
      area: 'Colombo 10',
      registrationDate: '2024-11-05',
      totalOrders: 11,
      status: 'Active'
    },
    {
      customerID: 'CUST010',
      name: 'Rekha Gunasekara',
      email: 'rekha.gunesekara@gmail.com',
      phone: '+94709876543',
      password: btoa('password123'),
      address: '12, Lewis Place, Negombo',
      postalCode: '11500',
      area: 'Negombo',
      registrationDate: '2024-11-18',
      totalOrders: 4,
      status: 'Active'
    }
  ],

  deliveryAgents: [
    {
      agentID: 'AGT001',
      name: 'Saman Silva',
      email: 'demo.agent@freshgrocers.lk',
      phone: '+94712345679',
      password: btoa('agent123'),
      currentLocation: 'Colombo 5',
      postalCode: '00500',
      area: 'Colombo 5',
      availabilityStatus: 'Online',
      rating: 4.7,
      totalDeliveries: 145,
      currentWorkload: 1,
      joinDate: '2023-03-15',
      status: 'Active',
      photo: null
    },
    {
      agentID: 'AGT002',
      name: 'Kamal Dissanayake',
      email: 'kamal.d@freshgrocers.lk',
      phone: '+94723456780',
      password: btoa('agent123'),
      currentLocation: 'Colombo 3',
      postalCode: '00300',
      area: 'Colombo 3',
      availabilityStatus: 'Online',
      rating: 4.5,
      totalDeliveries: 98,
      currentWorkload: 2,
      joinDate: '2023-06-20',
      status: 'Active',
      photo: null
    },
    {
      agentID: 'AGT003',
      name: 'Ranjith Premadasa',
      email: 'ranjith.p@freshgrocers.lk',
      phone: '+94734567891',
      password: btoa('agent123'),
      currentLocation: 'Nugegoda',
      postalCode: '10250',
      area: 'Nugegoda',
      availabilityStatus: 'Online',
      rating: 4.8,
      totalDeliveries: 230,
      currentWorkload: 0,
      joinDate: '2022-11-10',
      status: 'Active',
      photo: null
    },
    {
      agentID: 'AGT004',
      name: 'Nishantha Kumara',
      email: 'nishantha.k@freshgrocers.lk',
      phone: '+94745678902',
      password: btoa('agent123'),
      currentLocation: 'Colombo 7',
      postalCode: '00700',
      area: 'Colombo 7',
      availabilityStatus: 'Offline',
      rating: 4.3,
      totalDeliveries: 67,
      currentWorkload: 0,
      joinDate: '2024-01-05',
      status: 'Active',
      photo: null
    },
    {
      agentID: 'AGT005',
      name: 'Chaminda Wickrama',
      email: 'chaminda.w@freshgrocers.lk',
      phone: '+94756789013',
      password: btoa('agent123'),
      currentLocation: 'Gampaha',
      postalCode: '11000',
      area: 'Gampaha',
      availabilityStatus: 'Online',
      rating: 4.6,
      totalDeliveries: 189,
      currentWorkload: 1,
      joinDate: '2023-01-28',
      status: 'Active',
      photo: null
    }
  ],

  administrators: [
    {
      adminID: 'ADM001',
      name: 'Admin User',
      email: 'admin@freshgrocers.lk',
      password: btoa('admin123'),
      role: 'SuperAdmin',
      status: 'Active'
    },
    {
      adminID: 'ADM002',
      name: 'CSR Representative',
      email: 'csr@freshgrocers.lk',
      password: btoa('csr123'),
      role: 'CSR',
      status: 'Active'
    }
  ],

  products: [
    // --- FRUITS (8) ---
    { productID: 'PROD001', name: 'Fresh Bananas', description: 'Locally sourced organic bananas, naturally ripened. Rich in potassium and natural energy.', category: 'Fruits', price: 250, stockQuantity: 150, unit: 'kg', status: 'Active', popularity: 95, emoji: '🍌' },
    { productID: 'PROD002', name: 'Alphonso Mangoes', description: 'Premium Alphonso mangoes with rich, sweet flavor. Seasonal import, limited stock.', category: 'Fruits', price: 600, stockQuantity: 50, unit: 'kg', status: 'Active', popularity: 88, emoji: '🥭' },
    { productID: 'PROD003', name: 'Green Apples', description: 'Crisp and tangy green apples. Excellent for snacking and cooking.', category: 'Fruits', price: 550, stockQuantity: 80, unit: 'kg', status: 'Active', popularity: 75, emoji: '🍎' },
    { productID: 'PROD004', name: 'Navel Oranges', description: 'Juicy navel oranges packed with Vitamin C. Perfect for juicing or eating fresh.', category: 'Fruits', price: 350, stockQuantity: 100, unit: 'kg', status: 'Active', popularity: 82, emoji: '🍊' },
    { productID: 'PROD005', name: 'Fresh Papaya', description: 'Tree-ripened papayas with sweet orange flesh. Great for digestion.', category: 'Fruits', price: 200, stockQuantity: 40, unit: 'piece', status: 'Active', popularity: 70, emoji: '🍈' },
    { productID: 'PROD006', name: 'Watermelon', description: 'Large seedless watermelons, sweet and refreshing. Perfect for hot days.', category: 'Fruits', price: 450, stockQuantity: 30, unit: 'piece', status: 'Active', popularity: 90, emoji: '🍉' },
    { productID: 'PROD007', name: 'Fresh Pineapple', description: 'Golden pineapples with balanced sweet-tart flavor. Hand-selected for ripeness.', category: 'Fruits', price: 350, stockQuantity: 45, unit: 'piece', status: 'Active', popularity: 72, emoji: '🍍' },
    { productID: 'PROD008', name: 'Avocado', description: 'Creamy Hass avocados perfect for toast, salads, or smoothies. Rich in healthy fats.', category: 'Fruits', price: 150, stockQuantity: 60, unit: 'piece', status: 'Active', popularity: 68, emoji: '🥑' },

    // --- VEGETABLES (8) ---
    { productID: 'PROD009', name: 'Fresh Tomatoes', description: 'Farm-fresh red tomatoes, vine-ripened for maximum flavor. Essential for curries.', category: 'Vegetables', price: 180, stockQuantity: 200, unit: 'kg', status: 'Active', popularity: 96, emoji: '🍅' },
    { productID: 'PROD010', name: 'Potatoes', description: 'Clean, washed potatoes ideal for curries, fries, and roasting.', category: 'Vegetables', price: 120, stockQuantity: 250, unit: 'kg', status: 'Active', popularity: 93, emoji: '🥔' },
    { productID: 'PROD011', name: 'Red Onions', description: 'Fresh red onions with strong flavor. Core ingredient in Sri Lankan cooking.', category: 'Vegetables', price: 150, stockQuantity: 300, unit: 'kg', status: 'Active', popularity: 97, emoji: '🧅' },
    { productID: 'PROD012', name: 'Carrots', description: 'Bright orange carrots, fresh and crunchy. Great raw or cooked.', category: 'Vegetables', price: 140, stockQuantity: 150, unit: 'kg', status: 'Active', popularity: 80, emoji: '🥕' },
    { productID: 'PROD013', name: 'Green Cabbage', description: 'Fresh, crisp green cabbage. Perfect for mallum and stir-fries.', category: 'Vegetables', price: 120, stockQuantity: 80, unit: 'piece', status: 'Active', popularity: 78, emoji: '🥬' },
    { productID: 'PROD014', name: 'Green Beans', description: 'Tender green beans, hand-picked at peak freshness.', category: 'Vegetables', price: 280, stockQuantity: 100, unit: 'kg', status: 'Active', popularity: 74, emoji: '🫘' },
    { productID: 'PROD015', name: 'Broccoli', description: 'Fresh broccoli crowns, rich in vitamins and fiber. Great for stir-fries.', category: 'Vegetables', price: 350, stockQuantity: 40, unit: 'piece', status: 'Active', popularity: 65, emoji: '🥦' },
    { productID: 'PROD016', name: 'Fresh Spinach', description: 'Baby spinach leaves, washed and ready to use. Perfect for salads and cooking.', category: 'Vegetables', price: 150, stockQuantity: 60, unit: '250g pack', status: 'Active', popularity: 71, emoji: '🌿' },

    // --- DAIRY (7) ---
    { productID: 'PROD017', name: 'Full Cream Milk', description: 'Fresh full cream milk, pasteurized and homogenized. Straight from local farms.', category: 'Dairy', price: 280, stockQuantity: 200, unit: 'L', status: 'Active', popularity: 94, emoji: '🥛' },
    { productID: 'PROD018', name: 'Low Fat Milk', description: 'Skimmed low-fat milk, ideal for health-conscious consumers.', category: 'Dairy', price: 290, stockQuantity: 150, unit: 'L', status: 'Active', popularity: 79, emoji: '🥛' },
    { productID: 'PROD019', name: 'Natural Yogurt', description: 'Thick and creamy natural yogurt with live cultures. No artificial additives.', category: 'Dairy', price: 180, stockQuantity: 100, unit: '400g', status: 'Active', popularity: 83, emoji: '🍶' },
    { productID: 'PROD020', name: 'Butter (200g)', description: 'Pure dairy butter made from fresh cream. Perfect for baking and cooking.', category: 'Dairy', price: 320, stockQuantity: 80, unit: '200g', status: 'Active', popularity: 77, emoji: '🧈' },
    { productID: 'PROD021', name: 'Cheddar Cheese', description: 'Mature cheddar cheese with rich, sharp flavor. Imported and locally aged.', category: 'Dairy', price: 550, stockQuantity: 60, unit: '200g', status: 'Active', popularity: 69, emoji: '🧀' },
    { productID: 'PROD022', name: 'Cooking Cream', description: 'Rich cooking cream for sauces, soups, and desserts.', category: 'Dairy', price: 240, stockQuantity: 70, unit: '200ml', status: 'Active', popularity: 62, emoji: '🍦' },
    { productID: 'PROD023', name: 'Farm Fresh Eggs', description: 'Free-range eggs from local farms. Rich in protein and omega-3.', category: 'Dairy', price: 380, stockQuantity: 120, unit: '10 pack', status: 'Active', popularity: 91, emoji: '🥚' },

    // --- BAKERY (6) ---
    { productID: 'PROD024', name: 'White Bread Loaf', description: 'Soft white bread, freshly baked daily. Perfect for sandwiches and toast.', category: 'Bakery', price: 95, stockQuantity: 100, unit: 'loaf', status: 'Active', popularity: 89, emoji: '🍞' },
    { productID: 'PROD025', name: 'Whole Wheat Bread', description: 'Nutritious whole wheat bread with high fiber content. Baked fresh daily.', category: 'Bakery', price: 120, stockQuantity: 80, unit: 'loaf', status: 'Active', popularity: 76, emoji: '🍞' },
    { productID: 'PROD026', name: 'Dinner Rolls (6 pack)', description: 'Soft, fluffy dinner rolls perfect for meals or as a snack with butter.', category: 'Bakery', price: 150, stockQuantity: 60, unit: '6 pack', status: 'Active', popularity: 71, emoji: '🥖' },
    { productID: 'PROD027', name: 'Butter Croissants', description: 'Flaky, buttery croissants baked fresh each morning. A breakfast favourite.', category: 'Bakery', price: 280, stockQuantity: 40, unit: '4 pack', status: 'Active', popularity: 67, emoji: '🥐' },
    { productID: 'PROD028', name: 'Chocolate Cake Slice', description: 'Rich chocolate cake slice with ganache frosting. Homemade-style quality.', category: 'Bakery', price: 180, stockQuantity: 30, unit: 'slice', status: 'Active', popularity: 74, emoji: '🎂' },
    { productID: 'PROD029', name: 'Coconut Cookies', description: 'Traditional Sri Lankan coconut cookies, crisp and lightly sweetened.', category: 'Bakery', price: 220, stockQuantity: 70, unit: '200g', status: 'Active', popularity: 78, emoji: '🍪' },

    // --- BEVERAGES (7) ---
    { productID: 'PROD030', name: 'Orange Juice (1L)', description: '100% pure squeezed orange juice, no added sugar or preservatives.', category: 'Beverages', price: 360, stockQuantity: 120, unit: 'L', status: 'Active', popularity: 86, emoji: '🧃' },
    { productID: 'PROD031', name: 'Apple Juice (1L)', description: 'Fresh pressed apple juice, naturally sweet with no artificial flavors.', category: 'Beverages', price: 380, stockQuantity: 100, unit: 'L', status: 'Active', popularity: 81, emoji: '🧃' },
    { productID: 'PROD032', name: 'Green Tea (25 bags)', description: 'Premium Ceylon green tea bags. Rich in antioxidants for daily wellness.', category: 'Beverages', price: 290, stockQuantity: 80, unit: '25 bags', status: 'Active', popularity: 72, emoji: '🍵' },
    { productID: 'PROD033', name: 'Instant Coffee (200g)', description: 'Rich, smooth instant coffee made from premium Arabica beans.', category: 'Beverages', price: 650, stockQuantity: 60, unit: '200g', status: 'Active', popularity: 85, emoji: '☕' },
    { productID: 'PROD034', name: 'Coca-Cola (1.5L)', description: 'The classic refreshing Coca-Cola beverage in a family-size bottle.', category: 'Beverages', price: 290, stockQuantity: 150, unit: '1.5L', status: 'Active', popularity: 92, emoji: '🥤' },
    { productID: 'PROD035', name: 'Mineral Water (1.5L)', description: 'Pure natural mineral water from Sri Lankan springs. Refreshing and clean.', category: 'Beverages', price: 80, stockQuantity: 200, unit: '1.5L', status: 'Active', popularity: 90, emoji: '💧' },
    { productID: 'PROD036', name: 'Mango Nectar (1L)', description: 'Thick, tropical mango nectar made from Alphonso mangoes. Kids favourite.', category: 'Beverages', price: 340, stockQuantity: 90, unit: 'L', status: 'Active', popularity: 79, emoji: '🧃' },

    // --- SNACKS (6) ---
    { productID: 'PROD037', name: 'Potato Chips (100g)', description: 'Crispy salted potato chips, perfect for snacking anytime.', category: 'Snacks', price: 180, stockQuantity: 150, unit: '100g', status: 'Active', popularity: 88, emoji: '🍟' },
    { productID: 'PROD038', name: 'Marie Biscuits (400g)', description: 'Classic Marie biscuits, lightly sweetened and great with tea.', category: 'Snacks', price: 140, stockQuantity: 120, unit: '400g', status: 'Active', popularity: 83, emoji: '🍪' },
    { productID: 'PROD039', name: 'Mixed Nuts (200g)', description: 'Premium blend of cashews, almonds, and pistachios. Protein-packed snack.', category: 'Snacks', price: 450, stockQuantity: 70, unit: '200g', status: 'Active', popularity: 77, emoji: '🥜' },
    { productID: 'PROD040', name: 'Milk Chocolate Bar', description: 'Creamy milk chocolate bar made from Sri Lankan cocoa. Smooth and indulgent.', category: 'Snacks', price: 280, stockQuantity: 100, unit: '100g', status: 'Active', popularity: 85, emoji: '🍫' },
    { productID: 'PROD041', name: 'Microwave Popcorn', description: 'Butter-flavored microwave popcorn, ready in 3 minutes. Movie night essential.', category: 'Snacks', price: 320, stockQuantity: 60, unit: '3 pack', status: 'Active', popularity: 74, emoji: '🍿' },
    { productID: 'PROD042', name: 'Granola Bar (6 pack)', description: 'Oat and honey granola bars, naturally sweetened and full of energy.', category: 'Snacks', price: 380, stockQuantity: 80, unit: '6 pack', status: 'Active', popularity: 70, emoji: '🌾' },

    // --- FROZEN (5) ---
    { productID: 'PROD043', name: 'Frozen Green Peas', description: 'Flash-frozen green peas, retaining maximum nutrients and flavour.', category: 'Frozen', price: 280, stockQuantity: 80, unit: '500g', status: 'Active', popularity: 76, emoji: '🫛' },
    { productID: 'PROD044', name: 'Vanilla Ice Cream', description: 'Classic vanilla bean ice cream, rich and creamy. Made with real vanilla.', category: 'Frozen', price: 420, stockQuantity: 50, unit: '500ml', status: 'Active', popularity: 87, emoji: '🍦' },
    { productID: 'PROD045', name: 'Frozen Fish Fillets', description: 'Premium white fish fillets, cleaned and frozen at sea for freshness.', category: 'Frozen', price: 650, stockQuantity: 40, unit: '500g', status: 'Active', popularity: 71, emoji: '🐟' },
    { productID: 'PROD046', name: 'Frozen Chicken Breast', description: 'Boneless chicken breast, individually frozen. High protein, low fat.', category: 'Frozen', price: 850, stockQuantity: 35, unit: '1kg', status: 'Active', popularity: 84, emoji: '🍗' },
    { productID: 'PROD047', name: 'Mixed Frozen Vegetables', description: 'Colourful mix of carrots, peas, corn, and beans. Frozen at peak freshness.', category: 'Frozen', price: 350, stockQuantity: 60, unit: '500g', status: 'Active', popularity: 73, emoji: '🥦' },

    // --- HOUSEHOLD (6) ---
    { productID: 'PROD048', name: 'Washing Powder (2kg)', description: 'Powerful bio-enzyme washing powder for whites and coloureds.', category: 'Household', price: 650, stockQuantity: 100, unit: '2kg', status: 'Active', popularity: 82, emoji: '🧺' },
    { productID: 'PROD049', name: 'Dish Washing Liquid', description: 'Concentrated dish soap that cuts through grease. Gentle on hands.', category: 'Household', price: 180, stockQuantity: 120, unit: '500ml', status: 'Active', popularity: 88, emoji: '🧴' },
    { productID: 'PROD050', name: 'Toilet Roll (4 pack)', description: '3-ply soft toilet paper rolls with extra absorption.', category: 'Household', price: 280, stockQuantity: 150, unit: '4 pack', status: 'Active', popularity: 93, emoji: '🧻' },
    { productID: 'PROD051', name: 'Kitchen Paper Towels', description: 'Strong absorbent kitchen paper towels for cleaning and cooking.', category: 'Household', price: 220, stockQuantity: 80, unit: '2 pack', status: 'Active', popularity: 80, emoji: '🧻' },
    { productID: 'PROD052', name: 'Hand Wash Liquid', description: 'Antibacterial liquid hand soap with aloe vera. Gentle and moisturizing.', category: 'Household', price: 250, stockQuantity: 100, unit: '500ml', status: 'Active', popularity: 86, emoji: '🧼' },
    { productID: 'PROD053', name: 'Floor Cleaner (1L)', description: 'Multi-surface floor cleaner with pine fragrance. Kills 99.9% of bacteria.', category: 'Household', price: 320, stockQuantity: 70, unit: '1L', status: 'Active', popularity: 75, emoji: '🧹' }
  ],

  orders: [
    // --- DELIVERED (6) ---
    {
      orderID: 'FG-2024-00001',
      orderDate: '2025-01-10T09:30:00',
      customerID: 'CUST001',
      items: [
        { productID: 'PROD001', quantity: 2, unitPrice: 250, subtotal: 500 },
        { productID: 'PROD009', quantity: 1, unitPrice: 180, subtotal: 180 },
        { productID: 'PROD017', quantity: 3, unitPrice: 280, subtotal: 840 }
      ],
      subtotal: 1520, deliveryFee: 150, tax: 83.50, totalAmount: 1753.50,
      deliveryAddress: '23, Galle Road, Colombo 03', postalCode: '00300', area: 'Colombo 3',
      deliverySlot: 'Morning 8-12', paymentMethod: 'COD', paymentStatus: 'Completed',
      deliveryStatus: 'Delivered', assignedAgentID: 'AGT002',
      assignedDate: '2025-01-10T10:00:00', deliveryCompletedDate: '2025-01-10T11:30:00'
    },
    {
      orderID: 'FG-2024-00002',
      orderDate: '2025-01-12T14:00:00',
      customerID: 'CUST003',
      items: [
        { productID: 'PROD010', quantity: 3, unitPrice: 120, subtotal: 360 },
        { productID: 'PROD011', quantity: 2, unitPrice: 150, subtotal: 300 },
        { productID: 'PROD024', quantity: 2, unitPrice: 95, subtotal: 190 }
      ],
      subtotal: 850, deliveryFee: 150, tax: 50.00, totalAmount: 1050.00,
      deliveryAddress: '12, High Level Road, Nugegoda', postalCode: '10250', area: 'Nugegoda',
      deliverySlot: 'Afternoon 12-4', paymentMethod: 'Online', paymentStatus: 'Completed',
      deliveryStatus: 'Delivered', assignedAgentID: 'AGT003',
      assignedDate: '2025-01-12T14:30:00', deliveryCompletedDate: '2025-01-12T16:00:00'
    },
    {
      orderID: 'FG-2024-00003',
      orderDate: '2025-01-15T10:00:00',
      customerID: 'CUST006',
      items: [
        { productID: 'PROD034', quantity: 2, unitPrice: 290, subtotal: 580 },
        { productID: 'PROD037', quantity: 3, unitPrice: 180, subtotal: 540 },
        { productID: 'PROD044', quantity: 1, unitPrice: 420, subtotal: 420 }
      ],
      subtotal: 1540, deliveryFee: 150, tax: 84.50, totalAmount: 1774.50,
      deliveryAddress: '34, Rosmead Place, Colombo 07', postalCode: '00700', area: 'Colombo 7',
      deliverySlot: 'Morning 8-12', paymentMethod: 'Online', paymentStatus: 'Completed',
      deliveryStatus: 'Delivered', assignedAgentID: 'AGT001',
      assignedDate: '2025-01-15T10:30:00', deliveryCompletedDate: '2025-01-15T12:00:00'
    },
    {
      orderID: 'FG-2024-00004',
      orderDate: '2025-01-20T16:00:00',
      customerID: 'CUST002',
      items: [
        { productID: 'PROD023', quantity: 2, unitPrice: 380, subtotal: 760 },
        { productID: 'PROD048', quantity: 1, unitPrice: 650, subtotal: 650 }
      ],
      subtotal: 1410, deliveryFee: 150, tax: 78.00, totalAmount: 1638.00,
      deliveryAddress: '45, Station Road, Colombo 05', postalCode: '00500', area: 'Colombo 5',
      deliverySlot: 'Evening 4-8', paymentMethod: 'COD', paymentStatus: 'Completed',
      deliveryStatus: 'Delivered', assignedAgentID: 'AGT001',
      assignedDate: '2025-01-20T16:30:00', deliveryCompletedDate: '2025-01-20T18:00:00'
    },
    {
      orderID: 'FG-2024-00005',
      orderDate: '2025-01-25T11:00:00',
      customerID: 'CUST007',
      items: [
        { productID: 'PROD046', quantity: 1, unitPrice: 850, subtotal: 850 },
        { productID: 'PROD012', quantity: 2, unitPrice: 140, subtotal: 280 },
        { productID: 'PROD015', quantity: 1, unitPrice: 350, subtotal: 350 }
      ],
      subtotal: 1480, deliveryFee: 150, tax: 81.50, totalAmount: 1711.50,
      deliveryAddress: '89, Bauddhaloka Mawatha, Colombo 04', postalCode: '00400', area: 'Colombo 4',
      deliverySlot: 'Afternoon 12-4', paymentMethod: 'COD', paymentStatus: 'Completed',
      deliveryStatus: 'Delivered', assignedAgentID: 'AGT002',
      assignedDate: '2025-01-25T12:00:00', deliveryCompletedDate: '2025-01-25T14:00:00'
    },
    {
      orderID: 'FG-2024-00006',
      orderDate: '2025-02-01T08:30:00',
      customerID: 'CUST009',
      items: [
        { productID: 'PROD033', quantity: 1, unitPrice: 650, subtotal: 650 },
        { productID: 'PROD032', quantity: 1, unitPrice: 290, subtotal: 290 },
        { productID: 'PROD038', quantity: 2, unitPrice: 140, subtotal: 280 }
      ],
      subtotal: 1220, deliveryFee: 150, tax: 68.50, totalAmount: 1438.50,
      deliveryAddress: '67, Maradana Road, Colombo 10', postalCode: '01000', area: 'Colombo 10',
      deliverySlot: 'Morning 8-12', paymentMethod: 'Online', paymentStatus: 'Completed',
      deliveryStatus: 'Delivered', assignedAgentID: 'AGT002',
      assignedDate: '2025-02-01T09:00:00', deliveryCompletedDate: '2025-02-01T11:00:00'
    },

    // --- OUT FOR DELIVERY (5) ---
    {
      orderID: 'FG-2025-00007',
      orderDate: '2025-02-24T09:00:00',
      customerID: 'CUST001',
      items: [
        { productID: 'PROD001', quantity: 3, unitPrice: 250, subtotal: 750 },
        { productID: 'PROD004', quantity: 2, unitPrice: 350, subtotal: 700 },
        { productID: 'PROD035', quantity: 4, unitPrice: 80, subtotal: 320 }
      ],
      subtotal: 1770, deliveryFee: 150, tax: 96.00, totalAmount: 2016.00,
      deliveryAddress: '23, Galle Road, Colombo 03', postalCode: '00300', area: 'Colombo 3',
      deliverySlot: 'Morning 8-12', paymentMethod: 'COD', paymentStatus: 'Pending',
      deliveryStatus: 'Out for Delivery', assignedAgentID: 'AGT002',
      assignedDate: '2025-02-24T09:30:00', deliveryCompletedDate: null
    },
    {
      orderID: 'FG-2025-00008',
      orderDate: '2025-02-24T10:30:00',
      customerID: 'CUST003',
      items: [
        { productID: 'PROD046', quantity: 1, unitPrice: 850, subtotal: 850 },
        { productID: 'PROD043', quantity: 2, unitPrice: 280, subtotal: 560 }
      ],
      subtotal: 1410, deliveryFee: 150, tax: 78.00, totalAmount: 1638.00,
      deliveryAddress: '12, High Level Road, Nugegoda', postalCode: '10250', area: 'Nugegoda',
      deliverySlot: 'Afternoon 12-4', paymentMethod: 'Online', paymentStatus: 'Completed',
      deliveryStatus: 'Out for Delivery', assignedAgentID: 'AGT003',
      assignedDate: '2025-02-24T11:00:00', deliveryCompletedDate: null
    },
    {
      orderID: 'FG-2025-00009',
      orderDate: '2025-02-24T11:00:00',
      customerID: 'CUST006',
      items: [
        { productID: 'PROD048', quantity: 1, unitPrice: 650, subtotal: 650 },
        { productID: 'PROD049', quantity: 2, unitPrice: 180, subtotal: 360 },
        { productID: 'PROD050', quantity: 2, unitPrice: 280, subtotal: 560 }
      ],
      subtotal: 1570, deliveryFee: 150, tax: 86.00, totalAmount: 1806.00,
      deliveryAddress: '34, Rosmead Place, Colombo 07', postalCode: '00700', area: 'Colombo 7',
      deliverySlot: 'Afternoon 12-4', paymentMethod: 'COD', paymentStatus: 'Pending',
      deliveryStatus: 'Out for Delivery', assignedAgentID: 'AGT001',
      assignedDate: '2025-02-24T11:30:00', deliveryCompletedDate: null
    },
    {
      orderID: 'FG-2025-00010',
      orderDate: '2025-02-24T12:00:00',
      customerID: 'CUST005',
      items: [
        { productID: 'PROD017', quantity: 4, unitPrice: 280, subtotal: 1120 },
        { productID: 'PROD023', quantity: 2, unitPrice: 380, subtotal: 760 }
      ],
      subtotal: 1880, deliveryFee: 150, tax: 101.50, totalAmount: 2131.50,
      deliveryAddress: '56, Main Street, Gampaha', postalCode: '11000', area: 'Gampaha',
      deliverySlot: 'Afternoon 12-4', paymentMethod: 'Online', paymentStatus: 'Completed',
      deliveryStatus: 'Out for Delivery', assignedAgentID: 'AGT005',
      assignedDate: '2025-02-24T12:30:00', deliveryCompletedDate: null
    },
    {
      orderID: 'FG-2025-00011',
      orderDate: '2025-02-24T13:00:00',
      customerID: 'CUST008',
      items: [
        { productID: 'PROD009', quantity: 2, unitPrice: 180, subtotal: 360 },
        { productID: 'PROD010', quantity: 3, unitPrice: 120, subtotal: 360 },
        { productID: 'PROD011', quantity: 2, unitPrice: 150, subtotal: 300 }
      ],
      subtotal: 1020, deliveryFee: 150, tax: 58.50, totalAmount: 1228.50,
      deliveryAddress: '23, Katubedda Road, Moratuwa', postalCode: '10400', area: 'Moratuwa',
      deliverySlot: 'Evening 4-8', paymentMethod: 'COD', paymentStatus: 'Pending',
      deliveryStatus: 'Out for Delivery', assignedAgentID: 'AGT003',
      assignedDate: '2025-02-24T13:30:00', deliveryCompletedDate: null
    },

    // --- PROCESSING (4) ---
    {
      orderID: 'FG-2025-00012',
      orderDate: '2025-02-25T07:00:00',
      customerID: 'CUST002',
      items: [
        { productID: 'PROD002', quantity: 2, unitPrice: 600, subtotal: 1200 },
        { productID: 'PROD019', quantity: 3, unitPrice: 180, subtotal: 540 }
      ],
      subtotal: 1740, deliveryFee: 150, tax: 94.50, totalAmount: 1984.50,
      deliveryAddress: '45, Station Road, Colombo 05', postalCode: '00500', area: 'Colombo 5',
      deliverySlot: 'Morning 8-12', paymentMethod: 'Online', paymentStatus: 'Completed',
      deliveryStatus: 'Processing', assignedAgentID: null,
      assignedDate: null, deliveryCompletedDate: null
    },
    {
      orderID: 'FG-2025-00013',
      orderDate: '2025-02-25T08:00:00',
      customerID: 'CUST004',
      items: [
        { productID: 'PROD025', quantity: 2, unitPrice: 120, subtotal: 240 },
        { productID: 'PROD027', quantity: 1, unitPrice: 280, subtotal: 280 },
        { productID: 'PROD029', quantity: 2, unitPrice: 220, subtotal: 440 }
      ],
      subtotal: 960, deliveryFee: 150, tax: 55.50, totalAmount: 1165.50,
      deliveryAddress: '78, Beach Road, Dehiwala', postalCode: '10350', area: 'Dehiwala',
      deliverySlot: 'Afternoon 12-4', paymentMethod: 'COD', paymentStatus: 'Pending',
      deliveryStatus: 'Processing', assignedAgentID: null,
      assignedDate: null, deliveryCompletedDate: null
    },
    {
      orderID: 'FG-2025-00014',
      orderDate: '2025-02-25T09:30:00',
      customerID: 'CUST009',
      items: [
        { productID: 'PROD052', quantity: 2, unitPrice: 250, subtotal: 500 },
        { productID: 'PROD053', quantity: 1, unitPrice: 320, subtotal: 320 },
        { productID: 'PROD051', quantity: 2, unitPrice: 220, subtotal: 440 }
      ],
      subtotal: 1260, deliveryFee: 150, tax: 70.50, totalAmount: 1480.50,
      deliveryAddress: '67, Maradana Road, Colombo 10', postalCode: '01000', area: 'Colombo 10',
      deliverySlot: 'Evening 4-8', paymentMethod: 'Online', paymentStatus: 'Completed',
      deliveryStatus: 'Processing', assignedAgentID: null,
      assignedDate: null, deliveryCompletedDate: null
    },
    {
      orderID: 'FG-2025-00015',
      orderDate: '2025-02-25T10:00:00',
      customerID: 'CUST007',
      items: [
        { productID: 'PROD039', quantity: 2, unitPrice: 450, subtotal: 900 },
        { productID: 'PROD040', quantity: 3, unitPrice: 280, subtotal: 840 }
      ],
      subtotal: 1740, deliveryFee: 150, tax: 94.50, totalAmount: 1984.50,
      deliveryAddress: '89, Bauddhaloka Mawatha, Colombo 04', postalCode: '00400', area: 'Colombo 4',
      deliverySlot: 'Morning 8-12', paymentMethod: 'COD', paymentStatus: 'Pending',
      deliveryStatus: 'Processing', assignedAgentID: null,
      assignedDate: null, deliveryCompletedDate: null
    },

    // --- RECEIVED (5) ---
    {
      orderID: 'FG-2025-00016',
      orderDate: '2025-02-25T10:45:00',
      customerID: 'CUST001',
      items: [
        { productID: 'PROD006', quantity: 1, unitPrice: 450, subtotal: 450 },
        { productID: 'PROD007', quantity: 1, unitPrice: 350, subtotal: 350 },
        { productID: 'PROD035', quantity: 6, unitPrice: 80, subtotal: 480 }
      ],
      subtotal: 1280, deliveryFee: 150, tax: 71.50, totalAmount: 1501.50,
      deliveryAddress: '23, Galle Road, Colombo 03', postalCode: '00300', area: 'Colombo 3',
      deliverySlot: 'Evening 4-8', paymentMethod: 'COD', paymentStatus: 'Pending',
      deliveryStatus: 'Received', assignedAgentID: null,
      assignedDate: null, deliveryCompletedDate: null
    },
    {
      orderID: 'FG-2025-00017',
      orderDate: '2025-02-25T11:00:00',
      customerID: 'CUST010',
      items: [
        { productID: 'PROD017', quantity: 2, unitPrice: 280, subtotal: 560 },
        { productID: 'PROD023', quantity: 1, unitPrice: 380, subtotal: 380 }
      ],
      subtotal: 940, deliveryFee: 150, tax: 54.50, totalAmount: 1144.50,
      deliveryAddress: '12, Lewis Place, Negombo', postalCode: '11500', area: 'Negombo',
      deliverySlot: 'Afternoon 12-4', paymentMethod: 'Online', paymentStatus: 'Completed',
      deliveryStatus: 'Received', assignedAgentID: null,
      assignedDate: null, deliveryCompletedDate: null
    },
    {
      orderID: 'FG-2025-00018',
      orderDate: '2025-02-25T11:15:00',
      customerID: 'CUST006',
      items: [
        { productID: 'PROD030', quantity: 2, unitPrice: 360, subtotal: 720 },
        { productID: 'PROD031', quantity: 1, unitPrice: 380, subtotal: 380 },
        { productID: 'PROD036', quantity: 2, unitPrice: 340, subtotal: 680 }
      ],
      subtotal: 1780, deliveryFee: 150, tax: 96.50, totalAmount: 2026.50,
      deliveryAddress: '34, Rosmead Place, Colombo 07', postalCode: '00700', area: 'Colombo 7',
      deliverySlot: 'Morning 8-12', paymentMethod: 'COD', paymentStatus: 'Pending',
      deliveryStatus: 'Received', assignedAgentID: null,
      assignedDate: null, deliveryCompletedDate: null
    },
    {
      orderID: 'FG-2025-00019',
      orderDate: '2025-02-25T11:30:00',
      customerID: 'CUST005',
      items: [
        { productID: 'PROD016', quantity: 2, unitPrice: 150, subtotal: 300 },
        { productID: 'PROD013', quantity: 2, unitPrice: 120, subtotal: 240 },
        { productID: 'PROD014', quantity: 1, unitPrice: 280, subtotal: 280 }
      ],
      subtotal: 820, deliveryFee: 150, tax: 48.50, totalAmount: 1018.50,
      deliveryAddress: '56, Main Street, Gampaha', postalCode: '11000', area: 'Gampaha',
      deliverySlot: 'Afternoon 12-4', paymentMethod: 'COD', paymentStatus: 'Pending',
      deliveryStatus: 'Received', assignedAgentID: null,
      assignedDate: null, deliveryCompletedDate: null
    },
    {
      orderID: 'FG-2025-00020',
      orderDate: '2025-02-25T12:00:00',
      customerID: 'CUST008',
      items: [
        { productID: 'PROD044', quantity: 2, unitPrice: 420, subtotal: 840 },
        { productID: 'PROD041', quantity: 2, unitPrice: 320, subtotal: 640 }
      ],
      subtotal: 1480, deliveryFee: 150, tax: 81.50, totalAmount: 1711.50,
      deliveryAddress: '23, Katubedda Road, Moratuwa', postalCode: '10400', area: 'Moratuwa',
      deliverySlot: 'Evening 4-8', paymentMethod: 'Online', paymentStatus: 'Completed',
      deliveryStatus: 'Received', assignedAgentID: null,
      assignedDate: null, deliveryCompletedDate: null
    }
  ],

  deliveries: [
    { deliveryID: 'DEL001', orderID: 'FG-2024-00001', agentID: 'AGT002', assignedDate: '2025-01-10T10:00:00', deliveryStatus: 'Delivered', completedDate: '2025-01-10T11:30:00', customerSignature: 'Kasun Perera' },
    { deliveryID: 'DEL002', orderID: 'FG-2024-00002', agentID: 'AGT003', assignedDate: '2025-01-12T14:30:00', deliveryStatus: 'Delivered', completedDate: '2025-01-12T16:00:00', customerSignature: 'Sandya Perera' },
    { deliveryID: 'DEL003', orderID: 'FG-2024-00003', agentID: 'AGT001', assignedDate: '2025-01-15T10:30:00', deliveryStatus: 'Delivered', completedDate: '2025-01-15T12:00:00', customerSignature: 'Malini Fernando' },
    { deliveryID: 'DEL004', orderID: 'FG-2024-00004', agentID: 'AGT001', assignedDate: '2025-01-20T16:30:00', deliveryStatus: 'Delivered', completedDate: '2025-01-20T18:00:00', customerSignature: 'Nimal Kumara' },
    { deliveryID: 'DEL005', orderID: 'FG-2024-00005', agentID: 'AGT002', assignedDate: '2025-01-25T12:00:00', deliveryStatus: 'Delivered', completedDate: '2025-01-25T14:00:00', customerSignature: 'Suresh Ranatunga' },
    { deliveryID: 'DEL006', orderID: 'FG-2024-00006', agentID: 'AGT002', assignedDate: '2025-02-01T09:00:00', deliveryStatus: 'Delivered', completedDate: '2025-02-01T11:00:00', customerSignature: 'Amara Silva' },
    { deliveryID: 'DEL007', orderID: 'FG-2025-00007', agentID: 'AGT002', assignedDate: '2025-02-24T09:30:00', deliveryStatus: 'In Transit', completedDate: null, customerSignature: null },
    { deliveryID: 'DEL008', orderID: 'FG-2025-00008', agentID: 'AGT003', assignedDate: '2025-02-24T11:00:00', deliveryStatus: 'In Transit', completedDate: null, customerSignature: null },
    { deliveryID: 'DEL009', orderID: 'FG-2025-00009', agentID: 'AGT001', assignedDate: '2025-02-24T11:30:00', deliveryStatus: 'Assigned', completedDate: null, customerSignature: null },
    { deliveryID: 'DEL010', orderID: 'FG-2025-00010', agentID: 'AGT005', assignedDate: '2025-02-24T12:30:00', deliveryStatus: 'In Transit', completedDate: null, customerSignature: null },
    { deliveryID: 'DEL011', orderID: 'FG-2025-00011', agentID: 'AGT003', assignedDate: '2025-02-24T13:30:00', deliveryStatus: 'Assigned', completedDate: null, customerSignature: null }
  ],

  feedback: [
    { feedbackID: 'FB001', customerID: 'CUST001', agentID: 'AGT002', orderID: 'FG-2024-00001', rating: 5, comments: 'Very professional and fast delivery! Highly recommend Kamal.', date: '2025-01-10T12:00:00' },
    { feedbackID: 'FB002', customerID: 'CUST003', agentID: 'AGT003', orderID: 'FG-2024-00002', rating: 5, comments: 'Ranjith is always on time and very polite. Excellent service!', date: '2025-01-12T16:30:00' },
    { feedbackID: 'FB003', customerID: 'CUST006', agentID: 'AGT001', orderID: 'FG-2024-00003', rating: 4, comments: 'Good delivery, products arrived fresh and well-packaged.', date: '2025-01-15T12:30:00' },
    { feedbackID: 'FB004', customerID: 'CUST002', agentID: 'AGT001', orderID: 'FG-2024-00004', rating: 5, comments: 'Saman is my favourite agent! Always delivers with a smile.', date: '2025-01-20T18:30:00' },
    { feedbackID: 'FB005', customerID: 'CUST007', agentID: 'AGT002', orderID: 'FG-2024-00005', rating: 4, comments: 'Quick delivery, everything was correct. Will order again.', date: '2025-01-25T14:30:00' },
    { feedbackID: 'FB006', customerID: 'CUST009', agentID: 'AGT002', orderID: 'FG-2024-00006', rating: 5, comments: 'Perfect delivery! Kamal was very helpful and friendly.', date: '2025-02-01T11:30:00' }
  ],

  payments: [
    { paymentID: 'PAY001', orderID: 'FG-2024-00001', paymentDate: '2025-01-10T11:30:00', amount: 1753.50, paymentMethod: 'COD', paymentStatus: 'Completed' },
    { paymentID: 'PAY002', orderID: 'FG-2024-00002', paymentDate: '2025-01-12T14:00:00', amount: 1050.00, paymentMethod: 'Online', paymentStatus: 'Completed' },
    { paymentID: 'PAY003', orderID: 'FG-2024-00003', paymentDate: '2025-01-15T10:30:00', amount: 1774.50, paymentMethod: 'Online', paymentStatus: 'Completed' },
    { paymentID: 'PAY004', orderID: 'FG-2024-00004', paymentDate: '2025-01-20T18:00:00', amount: 1638.00, paymentMethod: 'COD', paymentStatus: 'Completed' },
    { paymentID: 'PAY005', orderID: 'FG-2024-00005', paymentDate: '2025-01-25T14:00:00', amount: 1711.50, paymentMethod: 'COD', paymentStatus: 'Completed' },
    { paymentID: 'PAY006', orderID: 'FG-2024-00006', paymentDate: '2025-02-01T11:00:00', amount: 1438.50, paymentMethod: 'Online', paymentStatus: 'Completed' },
    { paymentID: 'PAY007', orderID: 'FG-2025-00008', paymentDate: '2025-02-24T10:30:00', amount: 1638.00, paymentMethod: 'Online', paymentStatus: 'Completed' },
    { paymentID: 'PAY008', orderID: 'FG-2025-00010', paymentDate: '2025-02-24T12:00:00', amount: 2131.50, paymentMethod: 'Online', paymentStatus: 'Completed' },
    { paymentID: 'PAY009', orderID: 'FG-2025-00014', paymentDate: '2025-02-25T09:30:00', amount: 1480.50, paymentMethod: 'Online', paymentStatus: 'Completed' },
    { paymentID: 'PAY010', orderID: 'FG-2025-00017', paymentDate: '2025-02-25T11:00:00', amount: 1144.50, paymentMethod: 'Online', paymentStatus: 'Completed' },
    { paymentID: 'PAY011', orderID: 'FG-2025-00020', paymentDate: '2025-02-25T12:00:00', amount: 1711.50, paymentMethod: 'Online', paymentStatus: 'Completed' }
  ]
};
