// js/data.js
// This script initializes realistic sample data for the IMS566 demonstration.

document.addEventListener('DOMContentLoaded', function() {
    initDemoData();
});

function initDemoData() {
    // 1. Default Categories
    const defaultCategories = [
        { id: 'C01', name: 'Electronics' },
        { id: 'C02', name: 'Stationery' },
        { id: 'C03', name: 'Clothing' },
        { id: 'C04', name: 'Furniture' },
        { id: 'C05', name: 'Accessories' }
    ];

    // 2. Default Suppliers
    const defaultSuppliers = [
        { id: 'S01', name: 'TechSource Malaysia', contact: 'Ali', phone: '012-3456789', email: 'ali@techsource.my', address: 'Kuala Lumpur' },
        { id: 'S02', name: 'Office Plus Sdn Bhd', contact: 'Sarah', phone: '013-9876543', email: 'sarah@officeplus.my', address: 'Selangor' },
        { id: 'S03', name: 'Mega Apparel', contact: 'Chong', phone: '016-5554444', email: 'chong@megaapparel.my', address: 'Penang' },
        { id: 'S04', name: 'ErgoFurnish KL', contact: 'Muthu', phone: '019-2223333', email: 'muthu@ergofurnish.my', address: 'Kuala Lumpur' },
        { id: 'S05', name: 'GadgetHub MY', contact: 'Diana', phone: '011-8889999', email: 'diana@gadgethub.my', address: 'Johor' }
    ];

    // 3. Default Products
    const defaultProducts = [
        { id: 'P01', name: 'Wireless Mouse', category: 'Electronics', supplier: 'TechSource Malaysia', desc: 'Ergonomic 2.4Ghz', buyPrice: 40.00, sellPrice: 75.00, qty: 25, minQty: 10 },
        { id: 'P02', name: 'Mechanical Keyboard', category: 'Electronics', supplier: 'TechSource Malaysia', desc: 'Blue switches', buyPrice: 150.00, sellPrice: 250.00, qty: 15, minQty: 5 },
        { id: 'P03', name: 'USB-C Cable', category: 'Electronics', supplier: 'GadgetHub MY', desc: 'Fast charging 2m', buyPrice: 10.00, sellPrice: 25.00, qty: 100, minQty: 20 },
        { id: 'P04', name: 'Office Chair', category: 'Furniture', supplier: 'ErgoFurnish KL', desc: 'Mesh back chair', buyPrice: 200.00, sellPrice: 350.00, qty: 10, minQty: 5 },
        { id: 'P05', name: 'Notebook', category: 'Stationery', supplier: 'Office Plus Sdn Bhd', desc: 'A5 dotted notebook', buyPrice: 5.00, sellPrice: 12.00, qty: 50, minQty: 15 },
        { id: 'P06', name: 'Printer Paper', category: 'Stationery', supplier: 'Office Plus Sdn Bhd', desc: 'A4 80gsm (500 sheets)', buyPrice: 12.00, sellPrice: 18.00, qty: 40, minQty: 20 },
        { id: 'P07', name: 'Company Polo Shirt', category: 'Clothing', supplier: 'Mega Apparel', desc: 'Cotton uniform', buyPrice: 30.00, sellPrice: 50.00, qty: 60, minQty: 10 },
        { id: 'P08', name: 'Laptop Backpack', category: 'Accessories', supplier: 'Mega Apparel', desc: 'Waterproof bag', buyPrice: 60.00, sellPrice: 120.00, qty: 20, minQty: 5 },
        { id: 'P09', name: 'Standing Desk', category: 'Furniture', supplier: 'ErgoFurnish KL', desc: 'Motorized desk', buyPrice: 600.00, sellPrice: 999.00, qty: 5, minQty: 2 },
        { id: 'P10', name: 'HDMI Monitor', category: 'Electronics', supplier: 'TechSource Malaysia', desc: '24-inch 1080p', buyPrice: 350.00, sellPrice: 500.00, qty: 8, minQty: 3 }
    ];

    // Check if data already exists to prevent overwriting user changes on refresh
    if (!localStorage.getItem('sm_categories')) {
        localStorage.setItem('sm_categories', JSON.stringify(defaultCategories));
    }
    if (!localStorage.getItem('sm_suppliers')) {
        localStorage.setItem('sm_suppliers', JSON.stringify(defaultSuppliers));
    }
    if (!localStorage.getItem('sm_products')) {
        localStorage.setItem('sm_products', JSON.stringify(defaultProducts));
    }

    // 4. THE FAIL-SAFE FOR USERS (Added here!)
    let users = JSON.parse(localStorage.getItem('sm_users')) || [];
    if (users.length === 0) {
        const defaultAdmin = {
            id: 'U001',
            name: 'Master Admin',
            email: 'admin@stockmate.com',
            password: 'Admin123',
            role: 'Administrator',
            status: 'Active'
        };
        users.push(defaultAdmin);
        localStorage.setItem('sm_users', JSON.stringify(users));
    }
}