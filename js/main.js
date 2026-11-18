// js/main.js

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Authentication Check (Protects all pages except login)
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.endsWith('index.html') || currentPath.endsWith('login.html') || currentPath.endsWith('/');
    
    if (!isLoginPage) {
        const isLoggedIn = localStorage.getItem('sm_loggedIn');
        if (!isLoggedIn) {
            window.location.href = 'index.html'; // Change to login.html if that is your file name
            return;
        }
    }

    // 2. Sidebar Toggle Logic
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); 
            // Toggle both common class names just to be safe
            sidebar.classList.toggle('show');
            sidebar.classList.toggle('active');
        });
    }

    // 3. Close sidebar when clicking outside of it on smaller/split screens
    document.addEventListener('click', function(e) {
        if (window.innerWidth < 992 && sidebar) {
            // If the click is NOT inside the sidebar and NOT on the toggle button
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('show');
                sidebar.classList.remove('active');
            }
        }
    });

    // 4. Logout Functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if(confirm("Are you sure you want to log out?")) {
                localStorage.removeItem('sm_loggedIn');
                // Optional: remove current user details too
                localStorage.removeItem('sm_currentUser'); 
                window.location.href = 'index.html';
            }
        });
    }
    
    // 5. Populate Top Navigation with Logged-In User Details
    const currentUser = JSON.parse(localStorage.getItem('sm_currentUser'));
    if (currentUser) {
        const topNavName = document.getElementById('topNavName');
        const topNavRole = document.getElementById('topNavRole');
        
        if (topNavName) topNavName.innerText = currentUser.name;
        if (topNavRole) topNavRole.innerText = currentUser.role;
    }
});