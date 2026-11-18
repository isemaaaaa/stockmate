document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form'); 

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // 1. STOPS THE GLITCH: Prevents the page from reloading natively
            e.preventDefault(); 

            // 2. Get the inputted values
            const emailInput = document.querySelector('input[type="email"]').value.trim();
            const passwordInput = document.querySelector('input[type="password"]').value;
            
            // 3. Check against the database
            const users = JSON.parse(localStorage.getItem('sm_users')) || [];
            const validUser = users.find(u => u.email === emailInput && u.password === passwordInput);

            if (validUser) {
                // 4. FIXES KEY MISMATCH: Ensure exact keys used by main.js
                localStorage.setItem('sm_loggedIn', 'true');
                localStorage.setItem('sm_currentUser', JSON.stringify({
                    name: validUser.name,
                    email: validUser.email,
                    role: validUser.role
                }));
                
                // 5. Send to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid email or password. Please try again.');
            }
        });
    }
});