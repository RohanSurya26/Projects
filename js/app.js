// State Management
const state = {
    isAuthenticated: false,
    userRole: null, // 'client' or 'admin'
    currentPage: 'dashboard',
    sidebarCollapsed: false,
    kotFilter: 'all',
    reportsTab: 'sales',
    customersData: [
        { name: "Arjun Foods", company: "Arjun Wholesale Foods", gst: "27AAACT1234B1Z5", phone: "+91 9876543210", email: "orders@arjunfoods.com", location: "Mumbai", type: "Wholesale", discount: "15%", outstanding: 25000, status: "Active" },
        { name: "Rahul Sharma", company: "", gst: "", phone: "+91 8888888888", email: "rahul@example.com", location: "Pune", type: "Regular", discount: "0%", outstanding: 0, status: "Active" },
        { name: "Priya Singh", company: "", gst: "", phone: "+91 7777777777", email: "priya.s@example.com", location: "Delhi", type: "Member", discount: "10%", outstanding: 1200, status: "Active" },
        { name: "FreshFarm Organics", company: "FreshFarm Organics Ltd", gst: "29AAACI4321A1Z9", phone: "+91 9999999999", email: "supply@freshfarm.com", location: "Bangalore", type: "Wholesale", discount: "20%", outstanding: 0, status: "Inactive" }
    ],
    inventoryData: [
        { code: "P001", name: "Chicken Biryani", category: "Main Course", type: "Non-Veg", price: 1204, gst: "18%", status: "Available" },
        { code: "P002", name: "Classic Burger", category: "Fast Food", type: "Non-Veg", price: 996, gst: "12%", status: "Available" },
        { code: "P003", name: "Margherita Pizza", category: "Fast Food", type: "Veg", price: 1245, gst: "12%", status: "Out of Stock" }
    ],
    kotOrders: [
        {
            id: "1042", table: "Table A2", time: "19:45", waiter: "Ravi", status: "ready", // pending -> prepared -> ready
            notes: "No onions, extra spicy", items: [{ name: "Chicken Biryani", qty: 2 }, { name: "Mojito", qty: 2 }]
        },
        {
            id: "1043", table: "Table C2", time: "19:50", waiter: "Amit", status: "prepared",
            notes: "Extra butter on naan", items: [{ name: "Classic Burger", qty: 1 }, { name: "French Fries", qty: 1 }]
        },
        {
            id: "1044", table: "Table B1", time: "20:05", waiter: "Suresh", status: "pending",
            notes: "", items: [{ name: "Margherita Pizza", qty: 1 }, { name: "Garlic Bread", qty: 1 }]
        },
        {
            id: "1045", table: "Table A4", time: "20:15", waiter: "Rahul", status: "pending",
            notes: "Serve drinks first", items: [{ name: "Pasta Alfredo", qty: 1 }, { name: "Lemonade", qty: 2 }]
        }
    ],
    usersData: [
        { id: "U001", name: "Ronie Admin", email: "admin@lumina.com", contact: "+91 9876543210", role: "Admin", status: "Active", permissions: { billing: true, discount: true, voidBill: true, cancelKot: true, reports: true, product: true, customer: true, user: true } },
        { id: "U002", name: "Amit Manager", email: "amit.m@lumina.com", contact: "+91 8888888888", role: "Manager", status: "Active", permissions: { billing: true, discount: true, voidBill: false, cancelKot: true, reports: true, product: true, customer: true, user: false } },
        { id: "U003", name: "Priya Cashier", email: "priya.c@lumina.com", contact: "+91 7777777777", role: "Cashier", status: "Active", permissions: { billing: true, discount: false, voidBill: false, cancelKot: false, reports: false, product: false, customer: true, user: false } },
        { id: "U004", name: "Rahul Waiter", email: "rahul.w@lumina.com", contact: "+91 9999999999", role: "Waiter", status: "Inactive", permissions: { billing: false, discount: false, voidBill: false, cancelKot: false, reports: false, product: false, customer: false, user: false } }
    ],
    userDeleteMode: false,
    selectedUsers: [],
    cart: [],
    clientsData: [
        { id: "C001", business: "Taste of India", email: "taste@example.com", type: "Full Restaurant (Dine-in)", contact: "+91 98765 43210", plan: "Premium", status: "Active", settings: { directBilling: true, kotSystem: true, tableManagement: true, reports: true, multiUserLogin: true, gstBilling: true }, licence: { startDate: "2024-03-10", endDate: "2025-03-10" } },
        { id: "C002", business: "Fresh Mart", email: "fresh@example.com", type: "Supermarket", contact: "+91 87654 32109", plan: "Standard", status: "Active", settings: { directBilling: true, kotSystem: false, tableManagement: false, reports: true, multiUserLogin: false, gstBilling: true }, licence: { startDate: "2026-01-10", endDate: "2027-01-10" } },
        { id: "C003", business: "Green Veg", email: "green@example.com", type: "Fruit and Vegetables Store", contact: "+91 76543 21098", plan: "Basic", status: "Inactive", settings: { directBilling: true, kotSystem: false, tableManagement: false, reports: false, multiUserLogin: false, gstBilling: false }, licence: { startDate: "2025-04-12", endDate: "2026-04-12" } }
    ]
};

// Product Database
const dishes = [
    { name: "Cappuccino", price: 374, icon: "ph-coffee" },
    { name: "Classic Burger", price: 996, icon: "ph-hamburger" },
    { name: "Margherita Pizza", price: 1245, icon: "ph-pizza" },
    { name: "Mojito", price: 664, icon: "ph-martini" },
    { name: "Caesar Salad", price: 830, icon: "ph-bowl-food" },
    { name: "Vanilla Scoop", price: 415, icon: "ph-ice-cream" },
    { name: "Craft Beer", price: 498, icon: "ph-beer-bottle" },
    { name: "Chicken Biryani", price: 1204, icon: "ph-cooking-pot" },
    { name: "Pasta Alfredo", price: 1079, icon: "ph-bowl-food" },
    { name: "French Fries", price: 540, icon: "ph-hamburger" },
    { name: "Grilled Salmon", price: 1826, icon: "ph-fish-simple" },
    { name: "Pancakes", price: 747, icon: "ph-coffee" },
    { name: "Garlic Bread", price: 457, icon: "ph-pizza" },
    { name: "Tomato Soup", price: 581, icon: "ph-bowl-food" },
    { name: "Tacos", price: 913, icon: "ph-hamburger" },
    { name: "Sushi Platter", price: 1992, icon: "ph-bowl-food" },
    { name: "Steak Frites", price: 2324, icon: "ph-cooking-pot" },
    { name: "Lemonade", price: 332, icon: "ph-martini" },
    { name: "Cheese Platter", price: 1328, icon: "ph-pizza" },
    { name: "Chocolate Lava Cake", price: 706, icon: "ph-ice-cream" }
];

// --- Page & Component Renderers ---

function renderLogin() {
    return `
        <div class="login-container">
            <div class="login-card">
                <h2>Lumina Hotel</h2>
                <p>Sign in to your account</p>
                <form id="login-form">
                    <div class="form-group">
                        <label>Login As</label>
                        <select id="role-select" required>
                            <option value="client">Client</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="hotel@example.com" value="demo@lumina.com" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" value="password" required>
                    </div>
                    <button type="submit" class="btn-primary">Sign In</button>
                </form>
            </div>
        </div>
    `;
}

function renderSidebar() {
    let menuItems = [];
    if (state.userRole === 'admin') {
        menuItems = [
            { id: 'dashboard', icon: 'ph-squares-four', label: 'Dashboard' },
            { id: 'client-management', icon: 'ph-users', label: 'Client Management' },
            { id: 'licence-management', icon: 'ph-certificate', label: 'Licence Management' }
        ];
    } else {
        menuItems = [
            { id: 'dashboard', icon: 'ph-squares-four', label: 'Dashboard' },
            { id: 'billing', icon: 'ph-receipt', label: 'Billing' },
            { id: 'tables', icon: 'ph-armchair', label: 'Table Mgt.' },
            { id: 'kot', icon: 'ph-cooking-pot', label: 'KOT System' },
            { id: 'products', icon: 'ph-package', label: 'Products' },
            { id: 'customers', icon: 'ph-users', label: 'Customers' },
            { id: 'reports', icon: 'ph-chart-bar', label: 'Reports' },
            { id: 'users', icon: 'ph-user-gear', label: 'User Mgt.' }
        ];
    }

    return `
        <aside class="sidebar ${state.sidebarCollapsed ? 'collapsed' : ''} ${state.sidebarMobileOpen ? 'mobile-open' : ''}" id="sidebar">
            <div class="sidebar-header">
                <h2>Lumina</h2>
                <button class="toggle-btn" id="toggle-sidebar">
                    <i class="ph ph-list"></i>
                </button>
            </div>
            <nav class="sidebar-menu">
                ${menuItems.map(item => `
                    <a class="menu-item ${state.currentPage === item.id ? 'active' : ''}" data-page="${item.id}">
                        <i class="ph ${item.icon}"></i>
                        <span>${item.label}</span>
                    </a>
                `).join('')}
            </nav>
            <div class="sidebar-footer">
                <p>"Excellence in every stay"</p>
                <button id="global-logout-btn" class="logout-btn">
                    <i class="ph ph-sign-out"></i>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    `;
}

function renderHeader() {
    return `
        <header class="top-header">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <button id="mobile-toggle-btn" class="mobile-only-btn" style="background: none; border: none; font-size: 1.5rem; color: var(--text-dark); cursor: pointer; display: none;">
                    <i class="ph ph-list"></i>
                </button>
                <h3 style="color: var(--text-dark); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">Good ${new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, ${state.userRole}!</h3>
            </div>
            <div class="user-info">
                <span><i class="ph ph-bell" style="font-size: 1.4rem; color: var(--text-muted); cursor: pointer;"></i></span>
                <div class="avatar">${state.userRole === 'admin' ? 'A' : 'C'}</div>
                <span>${state.userRole === 'admin' ? 'Administrator' : 'Client User'}</span>
            </div>
        </header>
    `;
}

function renderDashboard() {
    return `
        <h1 class="page-title">Dashboard Overview</h1>
        
        <div class="metrics-grid">
            <div class="metric-card" style="animation-delay: 0.1s">
                <div class="metric-info">
                    <h3>Today's Earnings</h3>
                    <div class="value">₹3,52,750</div>
                </div>
                <div class="metric-icon"><i class="ph ph-currency-dollar"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.2s">
                <div class="metric-info">
                    <h3>Total Bookings</h3>
                    <div class="value">124</div>
                </div>
                <div class="metric-icon" style="color: var(--warning); background: rgba(255, 159, 28, 0.1);"><i class="ph ph-calendar-check"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.3s">
                <div class="metric-info">
                    <h3>Available Rooms</h3>
                    <div class="value">42</div>
                </div>
                <div class="metric-icon" style="color: var(--success); background: rgba(46, 196, 182, 0.1);"><i class="ph ph-door"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.4s">
                <div class="metric-info">
                    <h3>Active KOTs</h3>
                    <div class="value">18</div>
                </div>
                <div class="metric-icon" style="color: var(--danger); background: rgba(231, 29, 54, 0.1);"><i class="ph ph-cooking-pot"></i></div>
            </div>
        </div>

        <div class="dashboard-grid">
            <div class="panel">
                <div class="panel-header">
                    <span class="panel-title">Yearly Sales Trend</span>
                    <i class="ph ph-trend-up" style="color: var(--text-muted);"></i>
                </div>
                <div style="position: relative; height: 300px; width: 100%;">
                    <canvas id="profitChart"></canvas>
                </div>
            </div>
            
            <div class="panel">
                <div class="panel-header">
                    <span class="panel-title">Recent Orders</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Table/Room</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>#1042</td><td>Table 4</td><td><span class="badge success">Served</span></td></tr>
                        <tr><td>#1043</td><td>Room 201</td><td><span class="badge warning">Cooking</span></td></tr>
                        <tr><td>#1044</td><td>Table 12</td><td><span class="badge warning">Cooking</span></td></tr>
                        <tr><td>#1045</td><td>Takeaway</td><td><span class="badge success">Ready</span></td></tr>
                        <tr><td>#1046</td><td>Room 305</td><td><span class="badge danger">Pending</span></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderAdminDashboard() {
    return `
        <h1 class="page-title">Admin Dashboard</h1>
        
        <div class="metrics-grid">
            <div class="metric-card" style="animation-delay: 0.1s">
                <div class="metric-info">
                    <h3>Total Clients</h3>
                    <div class="value">124</div>
                    <div class="trend positive" style="font-size: 0.85rem; margin-top: 4px; color: var(--success);"><i class="ph ph-trend-up"></i> +12% this month</div>
                </div>
                <div class="metric-icon"><i class="ph ph-users"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.2s">
                <div class="metric-info">
                    <h3>Active Businesses</h3>
                    <div class="value">98</div>
                    <div class="trend" style="font-size: 0.85rem; margin-top: 4px; color: var(--text-muted);">79% active rate</div>
                </div>
                <div class="metric-icon" style="color: var(--warning); background: rgba(255, 159, 28, 0.1);"><i class="ph ph-briefcase"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.3s">
                <div class="metric-info">
                    <h3>Monthly Revenue</h3>
                    <div class="value">₹4,52,000</div>
                    <div class="trend positive" style="font-size: 0.85rem; margin-top: 4px; color: var(--success);"><i class="ph ph-trend-up"></i> +15% this month</div>
                </div>
                <div class="metric-icon" style="color: var(--success); background: rgba(46, 196, 182, 0.1);"><i class="ph ph-currency-inr"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.4s">
                <div class="metric-info">
                    <h3>Growth Rate</h3>
                    <div class="value">8.5%</div>
                    <div class="trend positive" style="font-size: 0.85rem; margin-top: 4px; color: var(--success);"><i class="ph ph-trend-up"></i> +2.1% this month</div>
                </div>
                <div class="metric-icon" style="color: var(--secondary-color); background: rgba(76, 201, 240, 0.1);"><i class="ph ph-chart-line-up"></i></div>
            </div>
        </div>

        <div class="panel list-panel" style="margin-top: 2rem;">
            <div class="panel-header">
                <span class="panel-title" style="font-size: 1.25rem;">Clients List</span>
            </div>
            <div class="table-container" style="overflow-x: auto; margin-top: 1rem;">
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>License Type</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Hotel Lumina</strong></td>
                            <td><span class="badge primary">Premium</span></td>
                            <td><span class="badge success">Active</span></td>
                        </tr>
                        <tr>
                            <td><strong>Grand Palace</strong></td>
                            <td><span class="badge secondary">Standard</span></td>
                            <td><span class="badge success">Active</span></td>
                        </tr>
                        <tr>
                            <td><strong>Sea View Resort</strong></td>
                            <td><span class="badge primary">Premium</span></td>
                            <td><span class="badge warning">Trial</span></td>
                        </tr>
                        <tr>
                            <td><strong>City Inn</strong></td>
                            <td><span class="badge secondary">Standard</span></td>
                            <td><span class="badge danger">Inactive</span></td>
                        </tr>
                        <tr>
                            <td><strong>Paradise Hotel</strong></td>
                            <td><span class="badge primary">Premium</span></td>
                            <td><span class="badge success">Active</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderProducts() {
    return `
        <div class="products-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1 class="page-title" style="margin: 0;">Products Inventory</h1>
            <button id="add-product-btn" class="btn-primary" style="padding: 0.6rem 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; width: auto;">
                <i class="ph ph-plus"></i> Add Product
            </button>
        </div>
        <div class="panel">
            <div class="search-bar" style="position: relative; z-index: 20; margin-bottom: 2rem;">
                <i class="ph ph-magnifying-glass"></i>
                <input type="text" id="inventory-search" placeholder="Search by Product Name or Code...">
                <div id="inv-suggestions" class="suggestions-dropdown hidden"></div>
            </div>

            <div class="table-container" style="overflow-x: auto;">
                <table id="inventory-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>GST %</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.inventoryData.map(item => `
                            <tr>
                                <td><strong>${item.code}</strong></td>
                                <td>${item.name}</td>
                                <td>${item.category}</td>
                                <td><span class="badge ${item.type === 'Veg' ? 'success' : 'danger'}">${item.type}</span></td>
                                <td>₹${item.price}</td>
                                <td>${item.gst}</td>
                                <td><span class="badge ${item.status === 'Available' ? 'success' : 'warning'}">${item.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <!-- Modal Container -->
        <div id="products-modal-container"></div>
    `;
}

function renderAddProductModal() {
    return `
        <div class="modal-overlay" id="add-product-modal">
            <div class="modal-content permissions-modal" style="max-width: 700px;">
                <div class="modal-header">
                    <h2>Add Product Details</h2>
                    <button class="close-modal" id="close-add-product-modal"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body">
                    <div class="kot-tabs" style="margin-bottom: 1.5rem;">
                        <button class="kot-tab active" data-tab="basic">Basic Details</button>
                        <button class="kot-tab" data-tab="pricing">Pricing</button>
                        <button class="kot-tab" data-tab="restaurant">Restaurant Settings</button>
                    </div>
                    <form id="add-product-form">
                        <!-- Basic Details Tab -->
                        <div id="tab-basic" class="tab-content">
                            <div class="form-row" style="margin-bottom: 1rem;">
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Product Name *</label>
                                    <input type="text" id="np-name" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                                </div>
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Product Short Name (KOT / Bill print) *</label>
                                    <input type="text" id="np-short-name" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                                </div>
                            </div>
                            <div class="form-row" style="margin-bottom: 1rem;">
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Product Code *</label>
                                    <input type="text" id="np-code" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                                </div>
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Barcode / EAN</label>
                                    <input type="text" id="np-barcode" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                                </div>
                            </div>
                            <div class="form-row" style="margin-bottom: 1.5rem;">
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Category *</label>
                                    <select id="np-category" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px; background:#fff;">
                                        <option value="Main Course">Main Course</option>
                                        <option value="Starters">Starters</option>
                                        <option value="Beverages">Beverages</option>
                                        <option value="Desserts">Desserts</option>
                                    </select>
                                </div>
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Unit *</label>
                                    <select id="np-unit" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px; background:#fff;">
                                        <option value="kg">kg</option>
                                        <option value="ltr">ltr</option>
                                        <option value="box">box</option>
                                        <option value="plate">plate</option>
                                        <option value="bowl">bowl</option>
                                        <option value="bottle">bottle</option>
                                    </select>
                                </div>
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Product Type *</label>
                                    <select id="np-type" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px; background:#fff;">
                                        <option value="Finished">Finished</option>
                                        <option value="Raw Material">Raw Material</option>
                                        <option value="Service">Service</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Pricing Tab -->
                        <div id="tab-pricing" class="tab-content" style="display: none;">
                            <div class="form-row" style="margin-bottom: 1rem;">
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Cost Price</label>
                                    <input type="number" id="np-cost-price" step="0.1" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                                </div>
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Selling Price *</label>
                                    <input type="number" id="np-selling-price" step="0.1" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                                </div>
                            </div>
                            <div class="form-row" style="margin-bottom: 1rem;">
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">MRP</label>
                                    <input type="number" id="np-mrp" step="0.1" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                                </div>
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Wholesale Price</label>
                                    <input type="number" id="np-wholesale" step="0.1" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                                </div>
                            </div>
                            <div class="form-row" style="margin-bottom: 1.5rem;">
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">GST Rate</label>
                                    <select id="np-gst" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px; background:#fff;">
                                        <option value="0%">0%</option>
                                        <option value="5%">5%</option>
                                        <option value="10%">10%</option>
                                        <option value="15%">15%</option>
                                        <option value="28%">28%</option>
                                    </select>
                                </div>
                            </div>
                            <div style="border-top: 1px dashed var(--border-color); padding-top: 1.5rem; margin-bottom: 1.5rem;">
                                <div class="permissions-list">
                                    <div class="permission-item">
                                        <span>Allow Discount</span>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="np-allow-discount">
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <div class="permission-item">
                                        <span>Allow Price Edit During Billing</span>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="np-allow-price-edit">
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <div class="permission-item">
                                        <span>Tax Inclusive</span>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="np-tax-inclusive">
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Restaurant Settings Tab -->
                        <div id="tab-restaurant" class="tab-content" style="display: none;">
                            <div class="form-row" style="margin-bottom: 1rem;">
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Dine-in Price</label>
                                    <input type="number" id="np-dinein-price" step="0.1" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                                </div>
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Takeaway Price</label>
                                    <input type="number" id="np-takeaway-price" step="0.1" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                                </div>
                            </div>
                            <div class="form-row" style="margin-bottom: 1rem;">
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Veg/Non-Veg</label>
                                    <select id="np-veg-nonveg" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px; background:#fff;">
                                        <option value="Veg">Veg</option>
                                        <option value="Non-Veg">Non-Veg</option>
                                    </select>
                                </div>
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Kitchen Printer</label>
                                    <select id="np-kitchen-printer" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px; background:#fff;">
                                        <option value="Main Kitchen">Main Kitchen</option>
                                        <option value="Bar Counter">Bar Counter</option>
                                        <option value="Grill Section">Grill Section</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row" style="margin-bottom: 1.5rem;">
                                <div class="form-group" style="flex: 1;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Preparation Time (Minutes)</label>
                                    <input type="number" id="np-prep-time" min="0" step="1" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                                </div>
                            </div>
                            
                            <div style="border-top: 1px dashed var(--border-color); padding-top: 1.5rem; margin-bottom: 1.5rem;">
                                <div class="permissions-list">
                                    <div class="permission-item">
                                        <span>KOT Required</span>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="np-kot-required" checked>
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                    <div class="permission-item">
                                        <span>Recipe Linked</span>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="np-recipe-linked">
                                            <span class="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                            <button type="button" id="cancel-product-btn" class="btn-secondary" style="flex: 1; padding: 1rem; border-radius: 8px; font-size: 1.05rem;">Cancel</button>
                            <button type="submit" class="btn-primary" style="flex: 1; padding: 1rem; border-radius: 8px; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><i class="ph ph-check-circle"></i> Create Product</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderCustomers() {
    return `
        <h1 class="page-title">Customer Management</h1>
        <div class="panel">
            <div class="search-bar" style="position: relative; z-index: 20; margin-bottom: 2rem;">
                <i class="ph ph-magnifying-glass"></i>
                <input type="text" id="customers-search" placeholder="Search by Customer or Company Name...">
                <div id="cust-suggestions" class="suggestions-dropdown hidden"></div>
            </div>

            <div class="table-container" style="overflow-x: auto;">
                <table id="customers-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Contact</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th>Discount</th>
                            <th>Outstanding</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.customersData.map(c => renderCustomerRow(c)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderCustomerRow(c) {
    return `
        <tr>
            <td>
                <strong>${c.name}</strong>
                ${c.company ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">GST: ${c.gst}</div>` : ''}
            </td>
            <td>
                <div><i class="ph ph-phone"></i> ${c.phone}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);"><i class="ph ph-envelope"></i> ${c.email}</div>
            </td>
            <td>${c.location}</td>
            <td><span class="badge ${c.type === 'Wholesale' ? 'primary' : c.type === 'Member' ? 'warning' : 'secondary'}">${c.type}</span></td>
            <td>${c.discount}</td>
            <td style="${c.outstanding > 0 ? 'color: var(--danger); font-weight: 600;' : ''}">₹${c.outstanding}</td>
            <td><span class="badge ${c.status === 'Active' ? 'success' : 'danger'}">${c.status}</span></td>
        </tr>
    `;
}

function renderReports() {
    return `
        <div class="reports-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1 class="page-title" style="margin: 0;">Business Reports</h1>
            <div class="reports-actions" style="display: flex; gap: 1rem; align-items: center;">
                <input type="date" id="report-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" style="padding: 0.6rem; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.7);">
                <button id="export-report-btn" class="btn-primary" style="padding: 0.6rem 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="ph ph-export"></i> Export Report
                </button>
            </div>
        </div>
        
        <div class="report-content" id="printable-report">
            <div class="metrics-grid" style="margin-bottom: 2rem;">
                <div class="metric-card">
                    <div class="metric-info">
                        <h3>Total Sales</h3>
                        <div class="value">₹1,45,890</div>
                        <div class="trend positive"><i class="ph ph-trend-up"></i> +18.4%</div>
                    </div>
                    <div class="metric-icon"><i class="ph ph-currency-inr"></i></div>
                </div>
                <div class="metric-card">
                    <div class="metric-info">
                        <h3>Total Orders</h3>
                        <div class="value">328</div>
                        <div class="trend positive"><i class="ph ph-trend-up"></i> +12.1%</div>
                    </div>
                    <div class="metric-icon" style="color: var(--secondary-color); background: rgba(76, 201, 240, 0.1);"><i class="ph ph-receipt"></i></div>
                </div>
                <div class="metric-card">
                    <div class="metric-info">
                        <h3>Customers Served</h3>
                        <div class="value">842</div>
                        <div class="trend positive"><i class="ph ph-trend-up"></i> +8.5%</div>
                    </div>
                    <div class="metric-icon" style="color: var(--success); background: rgba(46, 196, 182, 0.1);"><i class="ph ph-users"></i></div>
                </div>
                <div class="metric-card">
                    <div class="metric-info">
                        <h3>Avg Order Value</h3>
                        <div class="value">₹445</div>
                        <div class="trend positive"><i class="ph ph-trend-up"></i> +4.2%</div>
                    </div>
                    <div class="metric-icon" style="color: var(--warning); background: rgba(255, 159, 28, 0.1);"><i class="ph ph-chart-bar"></i></div>
                </div>
            </div>

            <div class="report-tabs-wrapper" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem;">
                <button class="kot-tab report-tab ${state.reportsTab === 'sales' ? 'active' : ''}" data-tab="sales">Sales Report</button>
                <button class="kot-tab report-tab ${state.reportsTab === 'products' ? 'active' : ''}" data-tab="products">Product Report</button>
                <button class="kot-tab report-tab ${state.reportsTab === 'payment' ? 'active' : ''}" data-tab="payment">Payment Mode</button>
            </div>

            <div class="report-body">
                ${renderReportTabContent()}
            </div>
        </div>
    `;
}

function renderReportTabContent() {
    if (state.reportsTab === 'sales') {
        return `
            <div class="dashboard-grid" style="grid-template-columns: 2fr 1fr;">
                <div class="panel list-panel">
                    <div class="panel-header">
                        <span class="panel-title">Daily Sales Trend</span>
                    </div>
                    <div class="chart-wrapper" style="position: relative; height: 320px; width: 100%;">
                        <div class="line-anim-wrap"><canvas id="salesTrendChart"></canvas></div>
                    </div>
                </div>
                <div class="panel list-panel">
                    <div class="panel-header">
                        <span class="panel-title">Sales by Category</span>
                    </div>
                    <div class="chart-wrapper" style="position: relative; height: 320px; width: 100%;">
                        <div class="pie-anim-wrap"><canvas id="categoryPieChart"></canvas></div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.reportsTab === 'products') {
        const topProducts = [
            { rank: 1, name: "Chicken Biryani", qty: 450, rev: 541800, pct: "35%" },
            { rank: 2, name: "Margherita Pizza", qty: 320, rev: 398400, pct: "25%" },
            { rank: 3, name: "Classic Burger", qty: 280, rev: 278880, pct: "18%" },
            { rank: 4, name: "Paneer Tikka", qty: 150, rev: 124500, pct: "8%" },
            { rank: 5, name: "Chocolate Lava Cake", qty: 120, rev: 84720, pct: "5%" }
        ];
        
        return `
            <div class="panel list-panel">
                <div class="panel-header">
                    <span class="panel-title" style="font-size: 1.25rem;">Top Selling Products</span>
                </div>
                <div class="table-container" style="overflow-x: auto; margin-top: 1rem;">
                    <table style="table-layout: fixed; width: 100%;">
                        <thead>
                            <tr>
                                <th style="width: 15%;"># Rank</th>
                                <th style="width: 35%;">Product Name</th>
                                <th style="width: 16%;"><div style="text-align: right;">Quantity</div></th>
                                <th style="width: 18%;"><div style="text-align: right;">Revenue</div></th>
                                <th style="width: 16%;"><div style="text-align: right;">% Total</div></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topProducts.map(p => `
                                <tr>
                                    <td><div style="background: var(--primary-color); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">${p.rank}</div></td>
                                    <td><strong>${p.name}</strong></td>
                                    <td style="text-align: right;">${p.qty}</td>
                                    <td style="text-align: right; color: var(--success); font-weight: 600;">₹${p.rev.toLocaleString()}</td>
                                    <td style="text-align: right;"><span class="badge secondary" style="min-width: 50px; text-align: center;">${p.pct}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else {
        const paymentStats = [
            { mode: "UPI", amount: 65890, pct: "45%", icon: "qr-code" },
            { mode: "Card", amount: 51000, pct: "35%", icon: "credit-card" },
            { mode: "Cash", amount: 29000, pct: "20%", icon: "money" }
        ];
        
        return `
            <div class="dashboard-grid" style="grid-template-columns: 2fr 1fr;">
                <div class="panel list-panel">
                    <div class="panel-header">
                        <span class="panel-title" style="font-size: 1.25rem;">Payment Mode Distribution</span>
                    </div>
                    <div class="chart-wrapper" style="position: relative; height: 320px; width: 100%;">
                        <canvas id="paymentBarChart"></canvas>
                    </div>
                </div>
                <div class="panel list-panel">
                    <div class="panel-header">
                        <span class="panel-title" style="font-size: 1.25rem;">Payment Summary</span>
                    </div>
                    <div class="table-container" style="margin-top: 1rem; overflow-x: auto;">
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Mode</th>
                                    <th><div style="text-align: right;">Amount</div></th>
                                    <th><div style="text-align: right;">%</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${paymentStats.map(s => `
                                    <tr>
                                        <td><strong><i class="ph ph-${s.icon}" style="color: var(--text-muted); margin-right: 4px;"></i> ${s.mode}</strong></td>
                                        <td style="text-align: right; color: var(--success); font-weight: 600;">₹${s.amount.toLocaleString()}</td>
                                        <td style="text-align: right;"><span class="badge secondary" style="min-width: 50px; text-align: center;">${s.pct}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderPlaceholder(title, icon) {
    return `
        <h1 class="page-title">${title}</h1>
        <div class="empty-state">
            <i class="ph ${icon}"></i>
            <h3>${title} Module</h3>
            <p>This module is currently under development.</p>
        </div>
    `;
}

function renderClientManagement() {
    return `
        <div class="clients-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1 class="page-title" style="margin: 0;">Client Management</h1>
        </div>
        <div class="panel list-panel">
            <div class="table-container" style="overflow-x: auto;">
                <table id="clients-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Business</th>
                            <th>Type</th>
                            <th>Contact</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.clientsData.map(c => `
                            <tr>
                                <td>
                                    <strong>${c.business}</strong>
                                    <div style="font-size: 0.8rem; color: var(--text-muted);"><i class="ph ph-envelope"></i> ${c.email}</div>
                                </td>
                                <td>${c.type}</td>
                                <td>${c.contact}</td>
                                <td><span class="badge ${c.plan === 'Premium' ? 'primary' : c.plan === 'Standard' ? 'secondary' : 'warning'}">${c.plan}</span></td>
                                <td><span class="badge ${c.status === 'Active' ? 'success' : 'danger'}">${c.status}</span></td>
                                <td>
                                    <div style="display: flex; gap: 0.8rem;">
                                        <button class="btn-icon client-del-btn" data-id="${c.id}" style="color: var(--danger); background: none; border: none; cursor: pointer; font-size: 1.2rem;" title="Delete"><i class="ph ph-trash"></i></button>
                                        <button class="btn-icon client-settings-btn" data-id="${c.id}" style="color: var(--warning); background: none; border: none; cursor: pointer; font-size: 1.2rem;" title="Settings"><i class="ph ph-gear"></i></button>
                                        <button class="btn-icon client-edit-btn" data-id="${c.id}" style="color: var(--primary-color); background: none; border: none; cursor: pointer; font-size: 1.2rem;" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <!-- Modals -->
        <div id="client-modals-container"></div>
    `;
}

function renderClientSettingsModal(id) {
    const client = state.clientsData.find(c => c.id === id);
    if (!client) return '';
    return `
        <div class="modal-overlay" id="client-settings-modal">
            <div class="modal-content permissions-modal" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Module Settings - ${client.business}</h2>
                    <button class="close-modal" id="close-cli-set-modal"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body">
                    <div class="permissions-list">
                        ${Object.entries({
                            directBilling: "Direct Billing",
                            kotSystem: "KOT System",
                            tableManagement: "Table Management",
                            reports: "Reports",
                            multiUserLogin: "Multi-User Login",
                            gstBilling: "GST Billing"
                        }).map(([key, label]) => `
                            <div class="permission-item">
                                <span>${label}</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" class="cli-set-toggle" data-id="${client.id}" data-key="${key}" ${client.settings[key] ? 'checked' : ''}>
                                    <span class="slider round"></span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderClientEditModal(id) {
    const client = state.clientsData.find(c => c.id === id);
    if (!client) return '';
    return `
        <div class="modal-overlay" id="client-edit-modal">
            <div class="modal-content permissions-modal" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Edit Client - ${client.business}</h2>
                    <button class="close-modal" id="close-cli-edit-modal"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body">
                    <form id="client-edit-form" data-id="${client.id}">
                        <div class="form-row" style="margin-bottom: 1rem;">
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Business Name</label>
                                <input type="text" id="ce-business" value="${client.business}" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Email</label>
                                <input type="email" id="ce-email" value="${client.email}" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                            </div>
                        </div>
                        <div class="form-row" style="margin-bottom: 1rem;">
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Business Type</label>
                                <select id="ce-type" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px; background:#fff;">
                                    <option value="Full Restaurant (Dine-in)" ${client.type === 'Full Restaurant (Dine-in)' ? 'selected' : ''}>Full Restaurant (Dine-in)</option>
                                    <option value="Supermarket" ${client.type === 'Supermarket' ? 'selected' : ''}>Supermarket</option>
                                    <option value="Fruit and Vegetables Store" ${client.type === 'Fruit and Vegetables Store' ? 'selected' : ''}>Fruit and Vegetables Store</option>
                                    <option value="Food Court" ${client.type === 'Food Court' ? 'selected' : ''}>Food Court</option>
                                </select>
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Contact</label>
                                <input type="text" id="ce-contact" value="${client.contact}" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                            </div>
                        </div>
                        <div class="form-row" style="margin-bottom: 1.5rem;">
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Plan</label>
                                <select id="ce-plan" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px; background:#fff;">
                                    <option value="Premium" ${client.plan === 'Premium' ? 'selected' : ''}>Premium</option>
                                    <option value="Standard" ${client.plan === 'Standard' ? 'selected' : ''}>Standard</option>
                                    <option value="Basic" ${client.plan === 'Basic' ? 'selected' : ''}>Basic</option>
                                </select>
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Status</label>
                                <select id="ce-status" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px; background:#fff;">
                                    <option value="Active" ${client.status === 'Active' ? 'selected' : ''}>Active</option>
                                    <option value="Inactive" ${client.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; padding: 1rem; border-radius: 8px; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><i class="ph ph-check-circle"></i> Save Changes</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderLicenceManagement() {
    const today = new Date();
    // Use an absolute time for "today" in the calculation to ensure consistency
    today.setHours(0,0,0,0);
    
    const formattedClients = state.clientsData.map(c => {
        let endDate = new Date(c.licence.endDate);
        endDate.setHours(0,0,0,0);
        const diffTime = endDate - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let lStatus = "Active";
        if (daysLeft < 0) lStatus = "Expired";
        else if (daysLeft <= 30) lStatus = "Expiring Soon";
        
        return { ...c, daysLeft, lStatus };
    });

    const total = formattedClients.length;
    const active = formattedClients.filter(c => c.lStatus === 'Active').length;
    const expiring = formattedClients.filter(c => c.lStatus === 'Expiring Soon').length;
    const expired = formattedClients.filter(c => c.lStatus === 'Expired').length;

    return `
        <h1 class="page-title">Licence Management</h1>
        
        <div class="metrics-grid" style="margin-bottom: 2rem;">
            <div class="metric-card">
                <div class="metric-info">
                    <h3>Total Licences</h3>
                    <div class="value">${total}</div>
                </div>
                <div class="metric-icon" style="color: var(--primary-color); background: rgba(67, 97, 238, 0.1);"><i class="ph ph-certificate"></i></div>
            </div>
            <div class="metric-card">
                <div class="metric-info">
                    <h3>Active</h3>
                    <div class="value">${active}</div>
                </div>
                <div class="metric-icon" style="color: var(--success); background: rgba(46, 196, 182, 0.1);"><i class="ph ph-check-circle"></i></div>
            </div>
            <div class="metric-card">
                <div class="metric-info">
                    <h3>Expiring Soon</h3>
                    <div class="value">${expiring}</div>
                </div>
                <div class="metric-icon" style="color: var(--warning); background: rgba(255, 159, 28, 0.1);"><i class="ph ph-hourglass-high"></i></div>
            </div>
            <div class="metric-card">
                <div class="metric-info">
                    <h3>Expired</h3>
                    <div class="value">${expired}</div>
                </div>
                <div class="metric-icon" style="color: var(--danger); background: rgba(231, 29, 54, 0.1);"><i class="ph ph-warning-circle"></i></div>
            </div>
        </div>

        <div class="panel list-panel">
            <div class="panel-header" style="margin-bottom: 1rem;">
                <span class="panel-title" style="font-size: 1.25rem;">All Licences</span>
            </div>
            <div class="table-container" style="overflow-x: auto;">
                <table id="licences-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Plan</th>
                            <th>Start Date</th>
                            <th>Expiry Date</th>
                            <th>Days Left</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${formattedClients.map(c => `
                            <tr>
                                <td><strong>${c.business}</strong></td>
                                <td><span class="badge ${c.plan === 'Premium' ? 'primary' : c.plan === 'Standard' ? 'secondary' : 'warning'}">${c.plan}</span></td>
                                <td>${c.licence.startDate}</td>
                                <td>${c.licence.endDate}</td>
                                <td style="font-weight: 600; color: ${c.daysLeft < 0 ? 'var(--danger)' : c.daysLeft <= 30 ? 'var(--warning)' : 'var(--success)'};">${c.daysLeft}</td>
                                <td><span class="badge ${c.lStatus === 'Active' ? 'success' : c.lStatus === 'Expiring Soon' ? 'warning' : 'danger'}">${c.lStatus}</span></td>
                                <td>
                                    <button class="btn-primary licence-renew-btn" data-id="${c.id}" style="padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem;"><i class="ph ph-arrows-clockwise"></i> Renew</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderTables() {
    return `
        <h1 class="page-title">Table Management & Floor Plan</h1>
        
        <div class="metrics-grid">
            <div class="metric-card" style="animation-delay: 0.1s">
                <div class="metric-info">
                    <h3>Total Tables</h3>
                    <div class="value">10</div>
                </div>
                <div class="metric-icon"><i class="ph ph-squares-four"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.2s">
                <div class="metric-info">
                    <h3>Occupied</h3>
                    <div class="value">4</div>
                </div>
                <div class="metric-icon" style="color: var(--danger); background: rgba(231, 29, 54, 0.1);"><i class="ph ph-users-three"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.3s">
                <div class="metric-info">
                    <h3>Available</h3>
                    <div class="value">4</div>
                </div>
                <div class="metric-icon" style="color: var(--success); background: rgba(46, 196, 182, 0.1);"><i class="ph ph-check-circle"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.4s">
                <div class="metric-info">
                    <h3>Reserved</h3>
                    <div class="value">2</div>
                </div>
                <div class="metric-icon" style="color: var(--warning); background: rgba(255, 159, 28, 0.1);"><i class="ph ph-clock"></i></div>
            </div>
        </div>

        <div class="panel floor-layout-panel" style="animation: fadeIn 0.6s ease; padding: 2rem;">
            <div class="panel-header" style="margin-bottom: 2rem;">
                <span class="panel-title" style="font-size: 1.5rem;">Authentic Floor Layout</span>
                <div class="table-legend">
                    <span><div class="legend-dot" style="background: var(--success);"></div> Available</span>
                    <span><div class="legend-dot" style="background: var(--danger);"></div> Occupied</span>
                    <span><div class="legend-dot" style="background: var(--warning);"></div> Reserved</span>
                </div>
            </div>
            
            <div class="floor-zone">
                <h3 class="zone-title">Main Dining Hall</h3>
                <div class="zone-grid main-dining">
                    <!-- Rectangular Tables (4-6 Seats) -->
                    <div class="floor-table rect occupied">
                        <div class="table-surface">
                            <span class="t-name">T1</span>
                            <span class="t-seats"><i class="ph ph-users"></i> 4</span>
                        </div>
                    </div>
                    <div class="floor-table rect available">
                        <div class="table-surface">
                            <span class="t-name">T2</span>
                            <span class="t-seats"><i class="ph ph-users"></i> 4</span>
                        </div>
                    </div>
                    <div class="floor-table rect reserved">
                        <div class="table-surface">
                            <span class="t-name">T3</span>
                            <span class="t-seats"><i class="ph ph-users"></i> 6</span>
                            <span class="t-time">19:30</span>
                        </div>
                    </div>
                    <div class="floor-table rect occupied">
                        <div class="table-surface">
                            <span class="t-name">T4</span>
                            <span class="t-seats"><i class="ph ph-users"></i> 4</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="floor-zone-split">
                <div class="floor-zone half">
                    <h3 class="zone-title">Window Seats (Couples)</h3>
                    <div class="zone-grid window-seats">
                        <!-- Square/Small Tables (2 Seats) -->
                        <div class="floor-table small available">
                            <div class="table-surface"><span class="t-name">W1</span></div>
                        </div>
                        <div class="floor-table small occupied">
                            <div class="table-surface"><span class="t-name">W2</span></div>
                        </div>
                        <div class="floor-table small available">
                            <div class="table-surface"><span class="t-name">W3</span></div>
                        </div>
                        <div class="floor-table small available">
                            <div class="table-surface"><span class="t-name">W4</span></div>
                        </div>
                    </div>
                </div>
                
                <div class="floor-zone half">
                    <h3 class="zone-title">VIP Lounge</h3>
                    <div class="zone-grid vip-lounge">
                        <!-- Round/Large Tables (8 Seats) -->
                        <div class="floor-table round reserved">
                            <div class="table-surface">
                                <span class="t-name">V1</span>
                                <span class="t-seats"><i class="ph ph-users"></i> 8</span>
                                <span class="t-time">20:00</span>
                            </div>
                        </div>
                        <div class="floor-table round occupied">
                            <div class="table-surface">
                                <span class="t-name">V2</span>
                                <span class="t-seats"><i class="ph ph-users"></i> 8</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderKOT() {
    const total = state.kotOrders.length;
    const pending = state.kotOrders.filter(o => o.status === 'pending').length;
    const prepared = state.kotOrders.filter(o => o.status === 'prepared').length;
    const ready = state.kotOrders.filter(o => o.status === 'ready').length;

    const filtered = state.kotFilter === 'all' 
        ? state.kotOrders 
        : state.kotOrders.filter(o => o.status === state.kotFilter);

    const getTabClass = (filterGroup) => state.kotFilter === filterGroup ? 'active' : '';

    return `
        <h1 class="page-title">Kitchen Order Tickets (KOT)</h1>
        
        <div class="metrics-grid">
            <div class="metric-card" style="animation-delay: 0.1s">
                <div class="metric-info">
                    <h3>Total Orders</h3>
                    <div class="value">${total}</div>
                </div>
                <div class="metric-icon"><i class="ph ph-receipt"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.2s">
                <div class="metric-info">
                    <h3>Pending</h3>
                    <div class="value">${pending}</div>
                </div>
                <div class="metric-icon" style="color: var(--danger); background: rgba(231, 29, 54, 0.1);"><i class="ph ph-hourglass"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.3s">
                <div class="metric-info">
                    <h3>Prepared</h3>
                    <div class="value">${prepared}</div>
                </div>
                <div class="metric-icon" style="color: var(--warning); background: rgba(255, 159, 28, 0.1);"><i class="ph ph-cooking-pot"></i></div>
            </div>
            <div class="metric-card" style="animation-delay: 0.4s">
                <div class="metric-info">
                    <h3>Ready to Serve</h3>
                    <div class="value">${ready}</div>
                </div>
                <div class="metric-icon" style="color: var(--success); background: rgba(46, 196, 182, 0.1);"><i class="ph ph-bell-ringing"></i></div>
            </div>
        </div>

        <div class="kot-tabs">
            <button class="kot-tab ${getTabClass('all')}" data-filter="all">All Orders</button>
            <button class="kot-tab ${getTabClass('pending')}" data-filter="pending">Pending</button>
            <button class="kot-tab ${getTabClass('prepared')}" data-filter="prepared">Prepared</button>
            <button class="kot-tab ${getTabClass('ready')}" data-filter="ready">Ready to Serve</button>
        </div>

        <div class="kot-grid">
            ${filtered.length === 0 ? '<div class="empty-state" style="grid-column: 1/-1;">No orders found in this category.</div>' : ''}
            ${filtered.map(order => {
                let statusWidth = '33%';
                let statusColor = 'var(--danger)';
                let btnText = 'Mark as Prepared';
                let btnColorClass = 'btn-primary';
                let btnIcon = 'ph-cooking-pot';
                let nextStatus = 'prepared';

                if (order.status === 'prepared') {
                    statusWidth = '66%';
                    statusColor = 'var(--warning)';
                    btnText = 'Ready to Serve';
                    btnColorClass = 'btn-warning';
                    btnIcon = 'ph-bell-ringing';
                    nextStatus = 'ready';
                } else if (order.status === 'ready') {
                    statusWidth = '100%';
                    statusColor = 'var(--success)';
                    btnText = 'Mark as Served';
                    btnColorClass = 'btn-success';
                    btnIcon = 'ph-check-circle';
                    nextStatus = 'served';
                }

                return `
                <div class="kot-card" data-kotid="${order.id}" style="animation-delay: 0.1s">
                    <div class="kot-header">
                        <div>
                            <span class="kot-id">#${order.id}</span>
                            <span class="kot-table">${order.table}</span>
                        </div>
                        <div class="kot-time"><i class="ph ph-clock"></i> ${order.time}</div>
                    </div>
                    <div class="kot-waiter"><i class="ph ph-user"></i> Waiter: ${order.waiter}</div>
                    
                    <div class="kot-items">
                        ${order.items.map(item => `
                            <div class="kot-item">
                                <span class="qty">${item.qty}x</span>
                                <span class="name">${item.name}</span>
                            </div>
                        `).join('')}
                    </div>

                    ${order.notes ? `
                    <div class="kot-notes">
                        <i class="ph ph-note-pencil"></i> <span>${order.notes}</span>
                    </div>` : ''}

                    <div class="kot-progress-container">
                        <div class="kot-progress-labels">
                            <span>Pending</span>
                            <span>Prepared</span>
                            <span>Ready</span>
                        </div>
                        <div class="kot-progress-bar">
                            <div class="kot-progress-fill" style="width: ${statusWidth}; background: ${statusColor};"></div>
                        </div>
                    </div>

                    <div class="kot-card-actions" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="kot-action-btn ${btnColorClass}" data-id="${order.id}" data-next="${nextStatus}" style="flex: 1;">
                            <i class="ph ${btnIcon}"></i> ${btnText}
                        </button>
                        <button class="kot-print-btn btn-secondary" data-id="${order.id}" style="padding: 0.8rem; border-radius: 8px; flex-shrink: 0;" title="Print KOT">
                            <i class="ph ph-printer"></i>
                        </button>
                        <button class="kot-cancel-btn btn-secondary" data-id="${order.id}" style="padding: 0.8rem; border-radius: 8px; flex-shrink: 0; color: var(--danger); border-color: var(--danger);" title="Cancel KOT">
                            <i class="ph ph-x"></i>
                        </button>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderBilling() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    const isEmpty = state.cart.length === 0;

    return `
        <h1 class="page-title">Billing & POS</h1>
        <div class="billing-layout">
            <!-- Left Side: Search & Cart -->
            <div class="billing-left panel">
                <div class="search-bar" style="position: relative; z-index: 20; margin-bottom: 2rem;">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" id="product-search" placeholder="Search products by name or category...">
                    <div id="search-suggestions" class="suggestions-dropdown hidden"></div>
                </div>
                
                <div class="cart-section" style="margin-top: 1rem;">
                    <h3 style="margin-bottom: 1rem;">Current Order</h3>
                    <div class="cart-items" style="max-height: 480px; overflow-y: auto; padding-right: 0.5rem;">
                        ${isEmpty ? `
                            <div class="empty-cart" style="text-align:center; padding: 3rem 0; color: var(--text-muted);">
                                <i class="ph ph-shopping-cart" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                                <p style="font-size: 1.1rem;">No items selected</p>
                            </div>
                        ` : state.cart.map((item, cartIndex) => `
                            <div class="cart-item">
                                <span class="item-name">${item.name}</span>
                                <div class="item-qty">
                                    <button class="qty-btn minus" data-cindex="${cartIndex}">-</button>
                                    <span>${item.qty}</span>
                                    <button class="qty-btn plus" data-cindex="${cartIndex}">+</button>
                                </div>
                                <span class="item-price">₹${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Right Side: Customer & Checkout -->
            <div class="billing-right panel">
                <div class="customer-section" style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem;">Customer Details</h3>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <input type="text" placeholder="Full Name" style="width: 100%; padding: 0.8rem; border: 1px solid var(--border-color); border-radius: 8px;">
                    </div>
                    <div class="form-group">
                        <input type="text" placeholder="Phone Number" maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 0.8rem; border: 1px solid var(--border-color); border-radius: 8px;">
                    </div>
                </div>

                <div class="bill-summary ${isEmpty ? 'disabled-section' : ''}">
                    <div class="summary-line">
                        <span>Subtotal</span>
                        <span>₹${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-line">
                        <span>Tax (5%)</span>
                        <span>₹${tax.toFixed(2)}</span>
                    </div>
                    <div class="summary-line total">
                        <span>Total</span>
                        <span>₹${total.toFixed(2)}</span>
                    </div>
                </div>

                <div class="payment-section ${isEmpty ? 'disabled-section' : ''}">
                    <h3>Payment Mode</h3>
                    <div class="payment-options">
                        <label class="pay-option active">
                            <input type="radio" name="payment" checked>
                            <i class="ph ph-money"></i> Cash
                        </label>
                        <label class="pay-option">
                            <input type="radio" name="payment">
                            <i class="ph ph-credit-card"></i> Card
                        </label>
                        <label class="pay-option">
                            <input type="radio" name="payment">
                            <i class="ph ph-qr-code"></i> UPI
                        </label>
                    </div>
                </div>

                <div class="checkout-actions">
                    <button id="print-bill-btn" class="btn-secondary" ${isEmpty ? 'disabled' : ''}><i class="ph ph-printer"></i> Print Bill</button>
                    <button id="pay-bill-btn" class="btn-primary" ${isEmpty ? 'disabled' : ''}><i class="ph ph-check-circle"></i> Pay ₹${total.toFixed(2)}</button>
                </div>
            </div>
        </div>
    `;
}

function renderUsers() {
    return `
        <div class="users-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h1 class="page-title" style="margin: 0;">User Management</h1>
            <div class="header-dropdown" style="position: relative;">
                <button id="users-menu-dots" class="btn-primary" style="padding: 0.4rem 0.6rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; width: auto; font-size: 1.4rem; background: var(--surface); color: var(--text-dark); border: 1px solid var(--border-color); cursor: pointer;">
                    <i class="ph ph-dots-three-vertical"></i>
                </button>
                <div id="users-action-menu" class="dropdown-content hidden" style="position: absolute; right: 0; top: 100%; min-width: 160px; background: white; border-radius: 8px; box-shadow: var(--shadow-lg); z-index: 100; margin-top: 0.5rem; overflow: hidden; border: 1px solid var(--border-color);">
                    <button id="users-create-btn" style="width: 100%; text-align: left; padding: 0.8rem 1rem; border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.95rem; color: var(--text-dark); transition: background 0.2s;" onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background='none'"><i class="ph ph-user-plus" style="font-size: 1.1rem; color: var(--primary-color);"></i> Create User</button>
                    <button id="users-delete-user" class="danger" style="width: 100%; text-align: left; padding: 0.8rem 1rem; border: none; background: none; cursor: pointer; color: var(--danger); display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(231,29,54,0.1)'" onmouseout="this.style.background='none'"><i class="ph ph-trash" style="font-size: 1.1rem;"></i> Delete User</button>
                </div>
            </div>
        </div>
        <div class="panel list-panel">
            <div class="panel-header">
                <span class="panel-title" style="font-size: 1.25rem;">System Users</span>
            </div>
            <div class="table-container" style="overflow-x: auto; margin-top: 1rem;">
                <table style="width: 100%;" class="${state.userDeleteMode ? 'delete-mode-active' : ''}">
                    <thead>
                        <tr>
                            ${state.userDeleteMode ? '<th style="width: 50px;">Select</th>' : ''}
                            <th>Name</th>
                            <th>Email</th>
                            <th>Contact</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Permissions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.usersData.map(u => `
                            <tr>
                                ${state.userDeleteMode ? `<td><input type="checkbox" class="user-checkbox" data-userid="${u.id}" ${state.selectedUsers.includes(u.id) ? 'checked' : ''} style="transform: scale(1.3);"></td>` : ''}
                                <td><strong>${u.name}</strong></td>
                                <td>${u.email}</td>
                                <td>${u.contact}</td>
                                <td><span class="badge ${u.role === 'Admin' ? 'primary' : 'secondary'}">${u.role}</span></td>
                                <td><span class="badge ${u.status === 'Active' ? 'success' : 'danger'}">${u.status}</span></td>
                                <td>
                                    <button class="btn-secondary view-permissions-btn" data-userid="${u.id}" style="padding: 0.5rem 0.8rem; border-radius: 8px; font-size: 0.85rem;" ${state.userDeleteMode ? 'disabled' : ''}>
                                        <i class="ph ph-key"></i> View Permissions
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- User Delete Action Bar -->
        <div class="delete-action-bar ${state.userDeleteMode ? 'show' : ''}">
            <div><span class="selected-count">${state.selectedUsers.length}</span> Users Selected</div>
            <div class="delete-actions">
                <button id="cancel-delete-btn" class="btn-secondary" style="background: white;">Cancel</button>
                <button id="confirm-delete-btn" class="btn-primary" style="background: var(--danger); border-color: var(--danger);"><i class="ph ph-trash"></i> Delete Selected</button>
            </div>
        </div>

        <!-- Modal Container -->
        <div id="permissions-modal-container"></div>
    `;
}

function renderPermissionsModal(userId) {
    const user = state.usersData.find(u => u.id === userId);
    if (!user) return '';

    const perms = [
        { key: 'billing', label: 'Billing Access' },
        { key: 'discount', label: 'Discount Authority' },
        { key: 'voidBill', label: 'Void Bill' },
        { key: 'cancelKot', label: 'Cancel KOT' },
        { key: 'reports', label: 'Reports Access' },
        { key: 'product', label: 'Product Management' },
        { key: 'customer', label: 'Customer Management' },
        { key: 'user', label: 'User Management' }
    ];

    return `
        <div class="modal-overlay" id="perm-modal">
            <div class="modal-content permissions-modal">
                <div class="modal-header">
                    <h2>Permissions: ${user.name} <span style="font-size:0.9rem; color:var(--text-muted);">(${user.role})</span></h2>
                    <button class="close-modal" id="close-perm-modal"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body">
                    <div class="permissions-list">
                        ${perms.map(p => `
                            <div class="permission-item">
                                <span>${p.label}</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" class="perm-toggle-input" data-userid="${user.id}" data-perm="${p.key}" ${user.permissions[p.key] ? 'checked' : ''}>
                                    <span class="slider round"></span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAddUserModal() {
    return `
        <div class="modal-overlay" id="add-user-modal">
            <div class="modal-content permissions-modal" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Create New User</h2>
                    <button class="close-modal" id="close-add-user-modal"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body">
                    <form id="add-user-form">
                        <div class="form-row" style="margin-bottom: 1rem;">
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Full Name</label>
                                <input type="text" id="nu-name" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Mobile Number</label>
                                <input type="text" id="nu-mobile" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                            </div>
                        </div>
                        <div class="form-row" style="margin-bottom: 1rem;">
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Email</label>
                                <input type="email" id="nu-email" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Role</label>
                                <select id="nu-role" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px; background:#fff;">
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Waiter">Waiter</option>
                                    <option value="Cashier">Cashier</option>
                                    <option value="Captain">Captain</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row" style="margin-bottom: 1.5rem;">
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Username</label>
                                <input type="text" id="nu-username" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label style="display:block; margin-bottom:0.5rem; font-weight:500;">Password</label>
                                <input type="password" id="nu-password" required style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:8px;">
                            </div>
                        </div>
                        
                        <div style="border-top: 1px dashed var(--border-color); padding-top: 1.5rem; margin-bottom: 1.5rem;">
                            <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-dark);">Quick Permissions</h3>
                            <div class="permissions-list">
                                <div class="permission-item">
                                    <span>Billing Access</span>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="perm-billing">
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                                <div class="permission-item">
                                    <span>Report Access</span>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="perm-reports">
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                                <div class="permission-item">
                                    <span>Discount Authority</span>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="perm-discount">
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                                <div class="permission-item">
                                    <span>Void Bill</span>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="perm-voidBill">
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary" style="width: 100%; padding: 1rem; border-radius: 8px; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><i class="ph ph-check-circle"></i> Confirm User</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function showToast(message) {
    const existing = document.getElementById('global-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="ph ph-check-circle"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- App Controller ---

function render() {
    const appEl = document.getElementById('app');
    
    if (!state.isAuthenticated) {
        appEl.innerHTML = renderLogin();
        // Bind login event
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const role = document.getElementById('role-select').value;
            state.isAuthenticated = true;
            state.userRole = role;
            render();
        });
        return;
    }

    // Main Layout
    let pageContent = '';
    switch(state.currentPage) {
        case 'dashboard': pageContent = state.userRole === 'admin' ? renderAdminDashboard() : renderDashboard(); break;
        case 'billing': pageContent = renderBilling(); break;
        case 'tables': pageContent = renderTables(); break;
        case 'kot': pageContent = renderKOT(); break;
        case 'products': pageContent = renderProducts(); break;
        case 'customers': pageContent = renderCustomers(); break;
        case 'reports': pageContent = renderReports(); break;
        case 'users': pageContent = renderUsers(); break;
        case 'client-management': pageContent = renderClientManagement(); break;
        case 'licence-management': pageContent = renderLicenceManagement(); break;
        default: pageContent = state.userRole === 'admin' ? renderAdminDashboard() : renderDashboard();
    }

    appEl.innerHTML = `
        <div class="main-layout">
            ${renderSidebar()}
            <div class="content-wrapper">
                ${renderHeader()}
                <main class="page-content">
                    ${pageContent}
                </main>
            </div>
            ${state.sidebarMobileOpen ? '<div id="mobile-overlay" class="mobile-overlay"></div>' : ''}
        </div>
    `;

    bindEvents();
    
    // Initialize chart if on dashboard
    setTimeout(() => {
        if (state.currentPage === 'dashboard' && state.userRole !== 'admin') {
            initChart();
        } else if (state.currentPage === 'reports' && (state.reportsTab === 'sales' || state.reportsTab === 'payment')) {
            initReportsCharts();
        }
    }, 50);
}

function bindEvents() {
    // Users Menu Dropdown
    const menuDots = document.getElementById('users-menu-dots');
    const actionMenu = document.getElementById('users-action-menu');
    if (menuDots && actionMenu) {
        menuDots.addEventListener('click', (e) => {
            e.stopPropagation();
            actionMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!menuDots.contains(e.target) && !actionMenu.contains(e.target)) {
                actionMenu.classList.add('hidden');
            }
        });
    }

    // Users Delete User Button
    const deleteUserBtn = document.getElementById('users-delete-user');
    if (deleteUserBtn) {
        deleteUserBtn.addEventListener('click', () => {
            state.userDeleteMode = true;
            state.selectedUsers = [];
            render();
            if (actionMenu) actionMenu.classList.add('hidden');
        });
    }

    // Delete Mode Behaviors
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    userCheckboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const uid = e.target.getAttribute('data-userid');
            if (e.target.checked) {
                if (!state.selectedUsers.includes(uid)) state.selectedUsers.push(uid);
            } else {
                state.selectedUsers = state.selectedUsers.filter(id => id !== uid);
            }
            // Update counter in action bar
            const countEl = document.querySelector('.selected-count');
            if (countEl) countEl.textContent = state.selectedUsers.length;
        });
    });

    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            state.userDeleteMode = false;
            state.selectedUsers = [];
            render();
        });
    }

    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (state.selectedUsers.length > 0) {
                if (confirm(`Are you sure you want to delete ${state.selectedUsers.length} user(s)?`)) {
                    state.usersData = state.usersData.filter(u => !state.selectedUsers.includes(u.id));
                    state.userDeleteMode = false;
                    state.selectedUsers = [];
                    render();
                    showToast('User deleted successfully');
                }
            } else {
                alert('Please select at least one user to delete.');
            }
        });
    }

    // Add User Modal (Now mapped to users page "Create User")
    const addUserBtn = document.getElementById('users-create-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            const actMenu = document.getElementById('users-action-menu');
            if (actMenu) actMenu.classList.add('hidden');
            
            if (state.currentPage !== 'users') {
                state.currentPage = 'users';
                render();
            }
            
            setTimeout(() => {
                const container = document.getElementById('permissions-modal-container');
                if (container) {
                    container.innerHTML = renderAddUserModal();
                    
                    const closeBtn = document.getElementById('close-add-user-modal');
                    const overlay = document.getElementById('add-user-modal');
                    if(closeBtn) closeBtn.addEventListener('click', () => container.innerHTML = '');
                    if(overlay) overlay.addEventListener('click', (ev) => {
                        if (ev.target.id === 'add-user-modal') container.innerHTML = '';
                    });

                    const form = document.getElementById('add-user-form');
                    if (form) {
                        form.addEventListener('submit', (ev) => {
                            ev.preventDefault();
                            
                            const newUser = {
                                id: 'U' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                                name: document.getElementById('nu-name').value,
                                email: document.getElementById('nu-email').value,
                                contact: document.getElementById('nu-mobile').value,
                                role: document.getElementById('nu-role').value,
                                status: 'Active',
                                permissions: {
                                    billing: document.getElementById('perm-billing').checked,
                                    reports: document.getElementById('perm-reports').checked,
                                    discount: document.getElementById('perm-discount').checked,
                                    voidBill: document.getElementById('perm-voidBill').checked,
                                    cancelKot: false,
                                    product: false,
                                    customer: false,
                                    user: false
                                }
                            };
                            
                            state.usersData.push(newUser);
                            container.innerHTML = '';
                            render(); // Re-render the UI to show new user
                            showToast('User created');
                        });
                    }
                }
            }, 10);
        });
    }

    // User Permissions Modal
    const viewPermBtns = document.querySelectorAll('.view-permissions-btn');
    viewPermBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.getAttribute('data-userid');
            const container = document.getElementById('permissions-modal-container');
            if (container) {
                container.innerHTML = renderPermissionsModal(userId);
                
                const closeBtn = document.getElementById('close-perm-modal');
                const overlay = document.getElementById('perm-modal');
                if(closeBtn) closeBtn.addEventListener('click', () => container.innerHTML = '');
                if(overlay) overlay.addEventListener('click', (ev) => {
                    if (ev.target.id === 'perm-modal') container.innerHTML = '';
                });

                const toggles = container.querySelectorAll('.perm-toggle-input');
                toggles.forEach(toggle => {
                    toggle.addEventListener('change', (ev) => {
                        const uid = ev.target.getAttribute('data-userid');
                        const permKey = ev.target.getAttribute('data-perm');
                        const user = state.usersData.find(u => u.id === uid);
                        if (user) {
                            user.permissions[permKey] = ev.target.checked;
                            showToast('Permissions updated');
                        }
                    });
                });
            }
        });
    });

    // Global Logout
    const logoutBtn = document.getElementById('global-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            state.isAuthenticated = false;
            state.userRole = null;
            state.currentPage = 'dashboard';
            render();
            showToast('Logged out successfully!');
        });
    }

    // Sidebar Toggle
    const toggleBtn = document.getElementById('toggle-sidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
            render();
        });
    }

    // Mobile Sidebar Toggle
    const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', () => {
            state.sidebarMobileOpen = !state.sidebarMobileOpen;
            render();
        });
    }

    // Mobile Sidebar Overlay Click
    const mobileOverlay = document.getElementById('mobile-overlay');
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => {
            state.sidebarMobileOpen = false;
            render();
        });
    }

    // KOT Filter Tabs
    const kotTabs = document.querySelectorAll('.kot-tab');
    kotTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            state.kotFilter = e.currentTarget.getAttribute('data-filter');
            render();
        });
    });

    // KOT Print Buttons
    const kotPrintBtns = document.querySelectorAll('.kot-print-btn');
    kotPrintBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.currentTarget.getAttribute('data-id');
            const card = document.querySelector(`.kot-card[data-kotid="${orderId}"]`);
            if (card) {
                card.classList.add('print-focus');
                setTimeout(() => { window.print(); card.classList.remove('print-focus'); }, 100);
            }
        });
    });

    // KOT Cancel Buttons
    const kotCancelBtns = document.querySelectorAll('.kot-cancel-btn');
    kotCancelBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm("Are you sure you want to cancel this KOT?")) {
                const orderId = e.currentTarget.getAttribute('data-id');
                state.kotOrders = state.kotOrders.filter(o => o.id !== orderId);
                render();
            }
        });
    });

    // Inventory Search Autocomplete
    const invSearch = document.getElementById('inventory-search');
    const invSugg = document.getElementById('inv-suggestions');
    const invTable = document.getElementById('inventory-table');

    if (invSearch && invSugg) {
        invSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length > 0) {
                const filtered = state.inventoryData.filter(d => 
                    d.name.toLowerCase().includes(query) || 
                    d.code.toLowerCase().includes(query)
                );
                
                if (filtered.length > 0) {
                    invSugg.innerHTML = filtered.map(d => `
                        <div class="suggestion-item inv-sugg-item" data-code="${d.code}">
                            <div class="sugg-details" style="padding-left: 15px; width: 100%;">
                                <div style="display: flex; justify-content: space-between; width: 100%;">
                                    <span class="sugg-name">${d.name} (${d.code})</span>
                                    <span class="sugg-price">₹${d.price}</span>
                                </div>
                                <span style="font-size: 0.8rem; color: var(--text-muted);">${d.category} - ${d.type}</span>
                            </div>
                        </div>
                    `).join('');
                } else {
                    invSugg.innerHTML = '<div class="suggestion-item empty">No products found</div>';
                }
                invSugg.classList.remove('hidden');
            } else {
                invSugg.classList.add('hidden');
            }
        });

        invSugg.addEventListener('click', (e) => {
            const item = e.target.closest('.inv-sugg-item');
            if (item) {
                const code = item.getAttribute('data-code');
                const matched = state.inventoryData.find(d => d.code === code);
                
                invSearch.value = matched.name;
                invSugg.classList.add('hidden');
                
                if (invTable) {
                    const tbody = invTable.querySelector('tbody');
                    tbody.innerHTML = `
                        <tr>
                            <td><strong>${matched.code}</strong></td>
                            <td>${matched.name}</td>
                            <td>${matched.category}</td>
                            <td><span class="badge ${matched.type === 'Veg' ? 'success' : 'danger'}">${matched.type}</span></td>
                            <td>₹${matched.price}</td>
                            <td>${matched.gst}</td>
                            <td><span class="badge ${matched.status === 'Available' ? 'success' : 'warning'}">${matched.status}</span></td>
                        </tr>
                    `;
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!invSearch.contains(e.target) && !invSugg.contains(e.target)) {
                invSugg.classList.add('hidden');
            }
        });

        invSearch.addEventListener('keyup', (e) => {
             if (!invSearch.value.trim() && invTable) {
                 const tbody = invTable.querySelector('tbody');
                 tbody.innerHTML = state.inventoryData.map(item => `
                     <tr>
                         <td><strong>${item.code}</strong></td>
                         <td>${item.name}</td>
                         <td>${item.category}</td>
                         <td><span class="badge ${item.type === 'Veg' ? 'success' : 'danger'}">${item.type}</span></td>
                         <td>₹${item.price}</td>
                         <td>${item.gst}</td>
                         <td><span class="badge ${item.status === 'Available' ? 'success' : 'warning'}">${item.status}</span></td>
                     </tr>
                 `).join('');
             }
        });
    }

    // Customer Search Autocomplete
    const custSearch = document.getElementById('customers-search');
    const custSugg = document.getElementById('cust-suggestions');
    const custTable = document.getElementById('customers-table');

    if (custSearch && custSugg) {
        custSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length > 0) {
                const filtered = state.customersData.filter(c => 
                    c.name.toLowerCase().includes(query) || 
                    (c.company && c.company.toLowerCase().includes(query))
                );
                
                if (filtered.length > 0) {
                    custSugg.innerHTML = filtered.map(c => `
                        <div class="suggestion-item cust-sugg-item" data-name="${c.name}">
                            <div class="sugg-details" style="padding-left: 15px; width: 100%;">
                                <div style="display: flex; justify-content: space-between; width: 100%;">
                                    <span class="sugg-name">${c.name} ${c.company ? `(${c.company})` : ''}</span>
                                    <span class="sugg-price">${c.type}</span>
                                </div>
                                <span style="font-size: 0.8rem; color: var(--text-muted);">${c.phone} | ${c.location}</span>
                            </div>
                        </div>
                    `).join('');
                } else {
                    custSugg.innerHTML = '<div class="suggestion-item empty">No customers found</div>';
                }
                custSugg.classList.remove('hidden');
            } else {
                custSugg.classList.add('hidden');
            }
        });

        custSugg.addEventListener('click', (e) => {
            const item = e.target.closest('.cust-sugg-item');
            if (item) {
                const name = item.getAttribute('data-name');
                const matched = state.customersData.find(c => c.name === name);
                
                custSearch.value = matched.name;
                custSugg.classList.add('hidden');
                
                if (custTable) {
                    const tbody = custTable.querySelector('tbody');
                    tbody.innerHTML = renderCustomerRow(matched);
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!custSearch.contains(e.target) && !custSugg.contains(e.target)) {
                custSugg.classList.add('hidden');
            }
        });

        custSearch.addEventListener('keyup', (e) => {
             if (!custSearch.value.trim() && custTable) {
                 const tbody = custTable.querySelector('tbody');
                 tbody.innerHTML = state.customersData.map(c => renderCustomerRow(c)).join('');
             }
        });
    }

    // KOT Action Buttons
    const kotActionBtns = document.querySelectorAll('.kot-action-btn');
    kotActionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.currentTarget.getAttribute('data-id');
            const nextStatus = e.currentTarget.getAttribute('data-next');
            
            if (nextStatus === 'served') {
                // Remove from KOT if served
                state.kotOrders = state.kotOrders.filter(o => o.id !== orderId);
            } else {
                // Update status
                const order = state.kotOrders.find(o => o.id === orderId);
                if (order) {
                    order.status = nextStatus;
                }
            }
            render();
        });
    });

    // Report Tab Buttons
    const reportTabs = document.querySelectorAll('.report-tab');
    reportTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            state.reportsTab = e.currentTarget.getAttribute('data-tab');
            render();
        });
    });

    // Export Report
    const exportBtn = document.getElementById('export-report-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            document.getElementById('printable-report').classList.add('print-focus');
            setTimeout(() => { 
                window.print(); 
                document.getElementById('printable-report').classList.remove('print-focus'); 
            }, 100);
        });
    }

    // Print Bill
    const printBtn = document.getElementById('print-bill-btn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Search Autocomplete Logic
    const searchInput = document.getElementById('product-search');
    const suggestionsBox = document.getElementById('search-suggestions');
    const productsGrid = document.getElementById('products-grid');

    if (searchInput && suggestionsBox) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length > 0) {
                const filtered = dishes.filter(d => d.name.toLowerCase().includes(query));
                if (filtered.length > 0) {
                    suggestionsBox.innerHTML = filtered.map(d => `
                        <div class="suggestion-item" data-name="${d.name}">
                            <i class="ph ${d.icon}"></i>
                            <div class="sugg-details">
                                <span class="sugg-name">${d.name}</span>
                                <span class="sugg-price">₹${d.price.toFixed(2)}</span>
                            </div>
                        </div>
                    `).join('');
                } else {
                    suggestionsBox.innerHTML = '<div class="suggestion-item empty">No dishes found</div>';
                }
                suggestionsBox.classList.remove('hidden');
            } else {
                suggestionsBox.innerHTML = '';
                suggestionsBox.classList.add('hidden');
            }
        });

        suggestionsBox.addEventListener('click', (e) => {
            const item = e.target.closest('.suggestion-item');
            if (item && !item.classList.contains('empty')) {
                const name = item.getAttribute('data-name');
                searchInput.value = name;
                suggestionsBox.classList.add('hidden');
                
                // Filter the grid based on selection
                if (productsGrid) {
                    productsGrid.innerHTML = dishes
                        .filter(d => d.name === name)
                        .map(dish => `
                            <div class="product-card" data-index="${dishes.findIndex(d => d.name === dish.name)}">
                                <div class="product-icon"><i class="ph ${dish.icon}"></i></div>
                                <h4>${dish.name}</h4>
                                <p>₹${dish.price.toFixed(2)}</p>
                            </div>
                        `).join('');
                }

                // If on billing page, immediately add to cart
                if (state.currentPage === 'billing') {
                    const dish = dishes.find(d => d.name === name);
                    if (dish) {
                        const existing = state.cart.find(c => c.name === dish.name);
                        if (existing) {
                            existing.qty += 1;
                        } else {
                            state.cart.push({ name: dish.name, price: dish.price, qty: 1 });
                        }
                        searchInput.value = ''; // Reset UI
                        render();
                    }
                }
            }
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.classList.add('hidden');
            }
        });

        // Reset grid when search is cleared
        searchInput.addEventListener('keyup', (e) => {
             if (!searchInput.value.trim() && productsGrid) {
                 productsGrid.innerHTML = dishes.map((dish, i) => `
                     <div class="product-card" data-index="${i}">
                         <div class="product-icon"><i class="ph ${dish.icon}"></i></div>
                         <h4>${dish.name}</h4>
                         <p>₹${dish.price.toFixed(2)}</p>
                     </div>
                 `).join('');
             }
        });
    }

    // === Billing POS Cart Interactions ===
    if (state.currentPage === 'billing') {
        const pGrid = document.getElementById('products-grid');
        if (pGrid) {
            pGrid.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                if (card) {
                    const index = card.getAttribute('data-index');
                    if (index !== null) {
                        const dish = dishes[index];
                        const existing = state.cart.find(item => item.name === dish.name);
                        if (existing) {
                            existing.qty += 1;
                        } else {
                            state.cart.push({ name: dish.name, price: dish.price, qty: 1 });
                        }
                        render(); // Force UI update
                    }
                }
            });
        }

        const cartItems = document.querySelector('.cart-items');
        if (cartItems) {
            cartItems.addEventListener('click', (e) => {
                const btn = e.target.closest('.qty-btn');
                if (btn) {
                    const cIndex = btn.getAttribute('data-cindex');
                    if (btn.classList.contains('minus')) {
                        if (state.cart[cIndex].qty > 1) {
                            state.cart[cIndex].qty -= 1;
                        } else {
                            state.cart.splice(cIndex, 1);
                        }
                    } else if (btn.classList.contains('plus')) {
                        state.cart[cIndex].qty += 1;
                    }
                    render();
                }
            });
        }

        const payBtn = document.getElementById('pay-bill-btn');
        if (payBtn) {
            payBtn.addEventListener('click', () => {
                if (state.cart.length > 0) {
                    state.cart = []; // clear cart
                    render();
                    showToast('Payment successful!');
                }
            });
        }
        
        const bPrintBtn = document.getElementById('print-bill-btn');
        if (bPrintBtn) {
            bPrintBtn.addEventListener('click', () => {
                if (state.cart.length > 0) {
                    window.print();
                }
            });
        }
    }

    // Add Product Modal Logic
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            const container = document.getElementById('products-modal-container');
            if (container) {
                container.innerHTML = renderAddProductModal();
                
                const closeBtn = document.getElementById('close-add-product-modal');
                const overlay = document.getElementById('add-product-modal');
                const cancelBtn = document.getElementById('cancel-product-btn');
                
                const closeModal = () => { container.innerHTML = ''; };
                
                if(closeBtn) closeBtn.addEventListener('click', closeModal);
                if(cancelBtn) cancelBtn.addEventListener('click', closeModal);
                if(overlay) overlay.addEventListener('click', (ev) => {
                    if (ev.target.id === 'add-product-modal') closeModal();
                });

                // Tab switching logic for Add Product Modal
                const tabs = document.querySelectorAll('#add-product-modal .kot-tab');
                tabs.forEach(tab => {
                    tab.addEventListener('click', (ev) => {
                        ev.preventDefault(); // Prevent accidental form submission
                        // Remove active from all tabs
                        tabs.forEach(t => t.classList.remove('active'));
                        // Add active to clicked tab
                        ev.currentTarget.classList.add('active');
                        
                        // Hide all tab contents
                        document.querySelectorAll('#add-product-modal .tab-content').forEach(tc => {
                            tc.style.display = 'none';
                        });
                        
                        // Show the target tab content
                        const targetLine = ev.currentTarget.getAttribute('data-tab');
                        const targetContent = document.getElementById('tab-' + targetLine);
                        if (targetContent) {
                            targetContent.style.display = 'block';
                        }
                    });
                });

                const form = document.getElementById('add-product-form');
                if (form) {
                    form.addEventListener('submit', (ev) => {
                        ev.preventDefault();
                        const sellingPriceRaw = document.getElementById('np-selling-price') ? document.getElementById('np-selling-price').value : '0';
                        const gstRaw = document.getElementById('np-gst') ? document.getElementById('np-gst').value : '0%';
                        
                        const newProduct = {
                            code: document.getElementById('np-code').value,
                            name: document.getElementById('np-name').value,
                            category: document.getElementById('np-category').value,
                            type: document.getElementById('np-type').value === 'Finished' ? 'Veg' : 'Non-Veg',
                            price: parseFloat(sellingPriceRaw) || 0,
                            gst: gstRaw,
                            status: "Available"
                        };
                        state.inventoryData.unshift(newProduct);
                        closeModal();
                        render();
                        showToast('Product created');
                    });
                }
            }
        });
    }

    // Navigation
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const page = e.currentTarget.getAttribute('data-page');
            if (page && page !== state.currentPage) {
                state.currentPage = page;
                if (window.innerWidth <= 768) {
                    state.sidebarMobileOpen = false;
                }
                render();
            }
        });
    });

    // --- Client Management Logic ---
    if (state.currentPage === 'client-management') {
        const modalContainer = document.getElementById('client-modals-container');

        // Delete Action
        document.querySelectorAll('.client-del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                state.clientsData = state.clientsData.filter(c => c.id !== id);
                render();
                showToast('Business deleted successfully.');
            });
        });

        // Settings Action
        document.querySelectorAll('.client-settings-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (modalContainer) {
                    modalContainer.innerHTML = renderClientSettingsModal(id);
                    const modal = document.getElementById('client-settings-modal');
                    const closeBtn = document.getElementById('close-cli-set-modal');
                    
                    if (closeBtn) closeBtn.addEventListener('click', () => modalContainer.innerHTML = '');
                    if (modal) modal.addEventListener('click', (ev) => {
                        if (ev.target.id === 'client-settings-modal') modalContainer.innerHTML = '';
                    });

                    // Settings Toggle
                    modalContainer.querySelectorAll('.cli-set-toggle').forEach(toggle => {
                        toggle.addEventListener('change', (ev) => {
                            const cliId = ev.target.getAttribute('data-id');
                            const key = ev.target.getAttribute('data-key');
                            const client = state.clientsData.find(c => c.id === cliId);
                            if (client) {
                                client.settings[key] = ev.target.checked;
                            }
                        });
                    });
                }
            });
        });

        // Edit Action
        document.querySelectorAll('.client-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (modalContainer) {
                    modalContainer.innerHTML = renderClientEditModal(id);
                    const modal = document.getElementById('client-edit-modal');
                    const closeBtn = document.getElementById('close-cli-edit-modal');
                    
                    if (closeBtn) closeBtn.addEventListener('click', () => modalContainer.innerHTML = '');
                    if (modal) modal.addEventListener('click', (ev) => {
                        if (ev.target.id === 'client-edit-modal') modalContainer.innerHTML = '';
                    });

                    const form = document.getElementById('client-edit-form');
                    if (form) {
                        form.addEventListener('submit', (ev) => {
                            ev.preventDefault();
                            const cliId = form.getAttribute('data-id');
                            const client = state.clientsData.find(c => c.id === cliId);
                            if (client) {
                                client.business = document.getElementById('ce-business').value;
                                client.email = document.getElementById('ce-email').value;
                                client.type = document.getElementById('ce-type').value;
                                client.contact = document.getElementById('ce-contact').value;
                                client.plan = document.getElementById('ce-plan').value;
                                client.status = document.getElementById('ce-status').value;
                                
                                modalContainer.innerHTML = '';
                                render();
                                showToast('Client details updated');
                            }
                        });
                    }
                }
            });
        });
    }

    // --- Licence Management Logic ---
    if (state.currentPage === 'licence-management') {
        document.querySelectorAll('.licence-renew-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const client = state.clientsData.find(c => c.id === id);
                if (client) {
                    const today = new Date();
                    const nextYear = new Date(today);
                    nextYear.setFullYear(today.getFullYear() + 1);
                    
                    const formatDate = (date) => {
                        return date.toISOString().split('T')[0];
                    };

                    client.licence.startDate = formatDate(today);
                    client.licence.endDate = formatDate(nextYear);
                    
                    render();
                    showToast(`${client.business} licence renewed`);
                }
            });
        });
    }
}

let profitChartInstance = null;
let salesTrendChartInstance = null;
let categoryPieChartInstance = null;
let paymentBarChartInstance = null;

function initReportsCharts() {
    const trendCtx = document.getElementById('salesTrendChart');
    if (trendCtx) {
        if (salesTrendChartInstance) salesTrendChartInstance.destroy();
        salesTrendChartInstance = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                datasets: [{
                    label: 'Sales (₹)',
                    data: [112000, 95500, 108400, 124500, 166000, 207500, 145890],
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#4361ee',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) { return '₹' + context.parsed.y.toLocaleString(); }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [5, 5] }, ticks: { callback: function(value) { return '₹' + value; } } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    const pieCtx = document.getElementById('categoryPieChart');
    if (pieCtx) {
        if (categoryPieChartInstance) categoryPieChartInstance.destroy();
        categoryPieChartInstance = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Main Dish', 'Starters', 'Desserts', 'Beverages'],
                datasets: [{
                    data: [45, 25, 15, 15],
                    backgroundColor: ['#4361ee', '#3a0ca3', '#f72585', '#4cc9f0'],
                    borderWidth: 0
                }]
            },
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    const paymentCtx = document.getElementById('paymentBarChart');
    if (paymentCtx) {
        if (paymentBarChartInstance) paymentBarChartInstance.destroy();
        paymentBarChartInstance = new Chart(paymentCtx, {
            type: 'bar',
            data: {
                labels: ['UPI', 'Card', 'Cash'],
                datasets: [{
                    label: 'Amount (₹)',
                    data: [65890, 51000, 29000],
                    backgroundColor: ['#4cc9f0', '#4361ee', '#3a0ca3'],
                    borderRadius: 6,
                    barThickness: 50
                }]
            },
            options: {
                animation: {
                    duration: 1500,
                    easing: 'easeOutBounce',
                    delay: (context) => context.type === 'data' ? context.dataIndex * 200 : 0
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) { return '₹' + context.parsed.y.toLocaleString(); }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [5, 5] }, ticks: { callback: function(value) { return '₹' + value; } } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

function initChart() {
    const ctx = document.getElementById('profitChart');
    if (!ctx) return;

    if (profitChartInstance) {
        profitChartInstance.destroy();
    }

    profitChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue (₹)',
                data: [420000, 380000, 450000, 410000, 500000, 550000, 480000, 520000, 590000, 620000, 580000, 710000],
                borderColor: '#4361EE',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#4361EE',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#E9ECEF', drawBorder: false },
                    ticks: { color: '#8D99AE' }
                },
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#8D99AE' }
                }
            }
        }
    });
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    render();
});
