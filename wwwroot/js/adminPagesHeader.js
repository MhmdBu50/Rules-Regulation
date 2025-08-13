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

    // Mobile menu functionality with RTL support
    const burgerBtn = document.getElementById('burgerBtn');
    const sideNavBar = document.getElementById('sideNavBar');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (burgerBtn && sideNavBar && backdrop) {
        burgerBtn.addEventListener('click', function () {
            const isRTL = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';

            if (isRTL) {
                sideNavBar.style.right = '0';
                sideNavBar.style.left = 'auto';
            } else {
                sideNavBar.style.left = '0';
                sideNavBar.style.right = 'auto';
            }
            backdrop.style.display = 'block';
        });

        backdrop.addEventListener('click', function () {
            const isRTL = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';

            if (isRTL) {
                sideNavBar.style.right = '-100%';
            } else {
                sideNavBar.style.left = '-100%';
            }
            backdrop.style.display = 'none';
        });

        // Close menu if burger button disappears (e.g., on resize to desktop)
        function closeMenuIfBurgerHidden() {
            const burgerVisible = burgerBtn.offsetParent !== null;
            const menuOpen = backdrop.style.display === 'block';
            if (!burgerVisible && menuOpen) {
                // Close the menu
                const isRTL = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
                if (isRTL) {
                    sideNavBar.style.right = '-100%';
                } else {
                    sideNavBar.style.left = '-100%';
                }
                backdrop.style.display = 'none';
            }
        }
        window.addEventListener('resize', closeMenuIfBurgerHidden);
    }
});
