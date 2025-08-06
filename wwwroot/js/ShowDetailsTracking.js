// Show Details Tracking System
function logShowDetails(recordId) {
    fetch('/History/RecordAction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            recordId: recordId, 
            action: 'SHOW_DETAILS' 
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
        }
    })
    .catch(error => {
    });
}

// Auto-attach to all view details buttons
document.addEventListener('DOMContentLoaded', function() {
    // Look for buttons with various classes and attributes that indicate "View Details"
    const detailsButtons = document.querySelectorAll(
        '.view-details-btn, .details-btn, .btn-info, [data-action="show-details"], [onclick*="showDetails"], [onclick*="viewDetails"]'
    );
    
    detailsButtons.forEach(button => {
        // Only attach if it's a details button (not other info buttons)
        const buttonText = button.textContent.toLowerCase();
        const isDetailsButton = buttonText.includes('details') || 
                               buttonText.includes('تفاصيل') || 
                               button.classList.contains('view-details-btn') ||
                               button.hasAttribute('data-action') && button.getAttribute('data-action') === 'show-details';
        
        if (isDetailsButton) {
            button.addEventListener('click', function() {
                const recordId = this.getAttribute('data-record-id') || 
                               this.getAttribute('data-id') ||
                               this.closest('[data-record-id]')?.getAttribute('data-record-id') ||
                               this.closest('[data-id]')?.getAttribute('data-id');
                
                if (recordId) {
                    logShowDetails(parseInt(recordId));
                }
            });
        }
    });
});

// Manual function for existing onclick handlers
function trackShowDetails(recordId, callback) {
    logShowDetails(recordId);
    if (callback && typeof callback === 'function') {
        callback();
    }
}
