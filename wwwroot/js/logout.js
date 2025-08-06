// Logout functionality for Rules & Regulations System
// This script provides secure logout functionality that properly clears user sessions

/**
 * Performs a secure logout by making a POST request to the logout endpoint
 * This ensures that the user session is properly cleared and authentication is terminated
 */
function secureLogout() {
    // Mark that user is logging out
    sessionStorage.setItem('userLoggedOut', 'true');
    
    // Create a form dynamically to submit a POST request
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/Account/Logout';
    
    // Add anti-forgery token if available
    const antiForgeryToken = document.querySelector('input[name="__RequestVerificationToken"]');
    if (antiForgeryToken) {
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '__RequestVerificationToken';
        tokenInput.value = antiForgeryToken.value;
        form.appendChild(tokenInput);
    }
    
    // Add form to document and submit
    document.body.appendChild(form);
    form.submit();
}

/**
 * Alternative logout function using fetch API
 * This provides better user experience with loading states
 */
async function logoutWithFeedback() {
    try {
        // Mark that user is logging out
        sessionStorage.setItem('userLoggedOut', 'true');
        
        // Show loading state (optional)
        const loadingMessage = document.createElement('div');
        loadingMessage.innerHTML = 'Logging out...';
        loadingMessage.style.position = 'fixed';
        loadingMessage.style.top = '50%';
        loadingMessage.style.left = '50%';
        loadingMessage.style.transform = 'translate(-50%, -50%)';
        loadingMessage.style.background = 'rgba(0, 0, 0, 0.8)';
        loadingMessage.style.color = 'white';
        loadingMessage.style.padding = '20px';
        loadingMessage.style.borderRadius = '5px';
        loadingMessage.style.zIndex = '9999';
        document.body.appendChild(loadingMessage);

        // Get anti-forgery token
        const antiForgeryToken = document.querySelector('input[name="__RequestVerificationToken"]');
        
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        // Add anti-forgery token to headers if available
        if (antiForgeryToken) {
            headers['RequestVerificationToken'] = antiForgeryToken.value;
        }

        // Make logout request
        const response = await fetch('/Account/Logout', {
            method: 'POST',
            headers: headers,
            credentials: 'same-origin'
        });

        // Remove loading message
        document.body.removeChild(loadingMessage);

        if (response.ok) {
            // Clear any client-side data
            clearClientData();
            // Successful logout - redirect to login page
            window.location.replace('/Account/LoginPage');
        } else {
            console.error('Logout failed with status:', response.status);
            // Fallback: redirect anyway for security
            window.location.replace('/Account/LoginPage');
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Fallback: redirect to login page for security
        window.location.replace('/Account/LoginPage');
    }
}

/**
 * Clear client-side data (localStorage, sessionStorage, etc.)
 */
function clearClientData() {
    // Clear localStorage
    if (typeof(Storage) !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
    }
    
    // Clear any application-specific data
    if (window.savedRecordIds) {
        window.savedRecordIds = null;
    }
    if (window.showOnlySaved) {
        window.showOnlySaved = false;
    }
}

/**
 * Check authentication status on page load
 * This prevents access to cached pages after logout
 */
function checkAuthStatus() {
    // Only check on protected pages (not login page)
    if (window.location.pathname.includes('/Account/LoginPage')) {
        return;
    }

    // Make a quick request to check if still authenticated
    fetch('/Account/CheckAuth', {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(response => {
        if (!response.ok) {
            // Not authenticated, redirect to login
            window.location.href = '/Account/LoginPage';
        }
    })
    .catch(error => {
        console.error('Auth check failed:', error);
        // On error, redirect to login for security
        window.location.href = '/Account/LoginPage';
    });
}

/**
 * Prevent browser back button access to protected pages after logout
 * Updated to allow normal back button functionality while protecting against unauthorized access
 */
function preventBackButtonAccess() {
    // Only apply to protected pages
    if (window.location.pathname.includes('/Account/LoginPage')) {
        return;
    }

    // Only prevent back button if user has actually logged out
    let isLoggedOut = sessionStorage.getItem('userLoggedOut') === 'true';
    
    if (isLoggedOut) {
        // Only block if user logged out - redirect to login
        window.location.replace('/Account/LoginPage');
        return;
    }
    
    // For normal navigation, just check auth status but don't block
    window.addEventListener('popstate', function(event) {
        // Check authentication but allow normal back navigation
        fetch('/Account/CheckAuth', {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                // Not authenticated, redirect to login
                window.location.replace('/Account/LoginPage');
            }
            // If authenticated, allow normal back navigation
        })
        .catch(error => {
            console.error('Auth check failed:', error);
            // On error, redirect to login for security
            window.location.replace('/Account/LoginPage');
        });
    });
}

// Run security checks when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Clear logout state if on login page (successful login)
    if (window.location.pathname.includes('/Account/LoginPage')) {
        sessionStorage.removeItem('userLoggedOut');
        return;
    }
    
    checkAuthStatus();
    preventBackButtonAccess();
});

// Run security checks when page becomes visible (user returns to tab)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        checkAuthStatus();
    }
});

// Attach logout function to global scope for easy access
window.secureLogout = secureLogout;
window.logoutWithFeedback = logoutWithFeedback;
