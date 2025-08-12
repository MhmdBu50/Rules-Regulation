// Admin Portal JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Enhanced keyboard accessibility - support both Enter and Space
    document.addEventListener('keydown', function (e) {
        if (e.code === 'Enter' || e.code === 'Space' || e.key === ' ') {
            const target = document.activeElement;
            if (target && target.classList.contains('portal-card')) {
                e.preventDefault();
                target.click();
            }
        }
    });

    // Add subtle focus animations
    const cards = document.querySelectorAll('.portal-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (document.activeElement !== this) {
                this.style.transform = 'translateY(0)';
            }
        });

        // Add smooth transition when card gains focus
        card.addEventListener('focus', function() {
            this.style.transform = 'translateY(-2px)';
        });

        card.addEventListener('blur', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add click animation
    cards.forEach(card => {
        card.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-1px) scale(0.98)';
        });

        card.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px) scale(1)';
        });
    });
});
