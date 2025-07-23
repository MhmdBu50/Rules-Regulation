    // Open and close the side nav menu (mobile only)
    document.addEventListener("DOMContentLoaded", function () {
        const sidebar = document.getElementById('sideNavBar');
        const burgerBtn = document.getElementById('burgerBtn');
        const backdrop = document.getElementById('sidebarBackdrop');

        if (!sidebar || !burgerBtn || !backdrop) {
            console.warn("Sidebar, burgerBtn, or backdrop is missing in the DOM.");
            return;
        }

        burgerBtn.addEventListener('click', () => {
            sidebar.classList.remove('d-lg-none'); // force show sidebar
            sidebar.style.display = 'block';
            backdrop.style.display = 'block';

            setTimeout(() => {
                sidebar.style.width = '250px';
            }, 10);
        });

        backdrop.addEventListener('click', () => {
            sidebar.style.width = '0';               // Start slide-out animation
            backdrop.style.display = 'none';         // Instantly hide the backdrop

            setTimeout(() => {
                sidebar.style.display = 'none';        // Fully hide sidebar after animation
                sidebar.classList.add('d-lg-none');    // Reapply Bootstrap’s mobile-only hiding
            }, 300);
        });

        // Helper function to auto-close
        function closeSidebar() {
            sidebar.style.width = '0';
            backdrop.style.display = 'none';
            setTimeout(() => {
                sidebar.style.display = 'none';
                sidebar.classList.add('d-lg-none');
            }, 300);
        }

        // Auto-close when window resized large
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 992) {
                closeSidebar();
            }
        });
    });


    //  Safe SVG loader using innerHTML
    function getSVGFromTemplate(id) {
        const tpl = document.getElementById(id);
        if (!tpl) return null;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = tpl.innerHTML.trim();
        return wrapper.firstElementChild;
    }

    //  Replace .svg-container with normal version from template
    function initIcons(selector) {
        document.querySelectorAll(selector).forEach(container => {
            const parent = container.closest('[data-id]');
            if (!parent) return;

            const dataId = parent.getAttribute('data-id');
            const svg = getSVGFromTemplate(`normal-${dataId}`);
            if (svg) {
                container.innerHTML = '';  // clean existing
                container.appendChild(svg);
            }
        });
    }

    //  Toggle between normal and altered SVGs when clicked
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

    //  Wait until DOM is fully loaded, then run once
    document.addEventListener('DOMContentLoaded', () => {
        initIcons('.navigation-bar .svg-container');
        initIcons('#sideNavBar .svg-container');
    });