/**
 * Admin Mobile Menu JavaScript Functionality
 */

// Toggle between normal and altered SVGs when clicked
function alter(clickedEl) {
    document.querySelectorAll('[data-id]').forEach(el => {
        const id = el.dataset.id;
        const container = el.querySelector('.svg-container');
        const normal = getSVGFromTemplate(`normal-${id}`);
        if (container && normal) {
            container.innerHTML = '';
            container.appendChild(normal);
        }
    });

    const id = clickedEl.dataset.id;
    const container = clickedEl.querySelector('.svg-container');
    const altered = getSVGFromTemplate(`altered-${id}`);
    if (container && altered) {
        container.innerHTML = '';
        container.appendChild(altered);
    }
}

// Helper function to get SVG from templates
function getSVGFromTemplate(id) {
    const template = document.getElementById(id);
    if (template && template.content) {
        const content = template.content.cloneNode(true);
        return content.querySelector('svg');
    }
    return null;
}

/**
 * Close mobile menu helper function
 */
function closeMobileMenu() {
    const sideNavBar = document.getElementById('sideNavBar');
    const backdrop = document.getElementById('sidebarBackdrop');
    
    if (sideNavBar && backdrop) {
        const isRTL = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
        
        if (isRTL) {
            sideNavBar.style.right = '-100%';
        } else {
            sideNavBar.style.left = '-100%';
        }
        backdrop.style.display = 'none';
    }
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.alter = alter;
    window.closeMobileMenu = closeMobileMenu;
}