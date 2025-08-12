// Admin Pages Header JavaScript Functionality

/**
 * Navigate back to the previous page
 * Uses browser history if available, otherwise falls back to admin page
 */
function goBack() {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // Fallback to admin page if no history
        window.location.href = '/Admin/AdminPage';
    }
}

/**
 * Initialize admin header functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('Admin pages header loaded');

    var lang = document.documentElement.lang; 
    var backIcon = document.getElementById("back-icon");

    if (backIcon) {
        if (lang === "ar") {
            backIcon.src = "/svgs/Admin/backButton-left.svg"; 
        } else {
            backIcon.src = "/svgs/Admin/backButton-right.svg";
        }
    }
});
