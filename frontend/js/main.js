// Mobile Navigation Toggle
const hamburger = document.querySelector('#hamburger');
const navMenu = document.querySelector('#nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Auto-login functionality for this device
document.addEventListener('DOMContentLoaded', function() {
    // Check if this device has been authorized before
    if (!localStorage.getItem('deviceAuthorized') && window.location.href.includes('admin')) {
        // Redirect to login if trying to access admin without authorization
        if (!window.location.href.includes('admin-login.html')) {
            window.location.href = 'pages/admin-login.html';
        }
    }
});

// Auto-login function - call this after successful login
function authorizeDevice() {
    localStorage.setItem('deviceAuthorized', 'true');
}

// Remove device authorization (for logout)
function deauthorizeDevice() {
    localStorage.removeItem('deviceAuthorized');
}

// Export functions for other scripts to use
window.mainJs = {
    authorizeDevice: authorizeDevice,
    deauthorizeDevice: deauthorizeDevice
};

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
updateCartCount();

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = count;
    }
}