/**
 * Record Details Modal JavaScript Module
 * Contains functionality for displaying record details in modal popups
 */

// Record Details Modal Functions
function displayRecordDetailsModal(recordId) {
    // Show toast notification
    if (typeof showToast === 'function') {
        showToast('Showing information...');
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('recordDetailsModal'));
    const modalBody = document.getElementById('modalRecordDetails');
    
    // Reset modal content with loading spinner
    modalBody.innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading record details...</p>
        </div>
    `;
    
    // Show the modal
    modal.show();
    
    // Make AJAX call to get record details
    fetch('/Home/GetRecordDetails?id=' + recordId)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load record details');
            }
            return response.text();
        })
        .then(data => {
            modalBody.innerHTML = data;
        })
        .catch(error => {
            modalBody.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h6>Error Loading Details</h6>
                    <p>Sorry, we couldn't load the record details. Please try again later.</p>
                </div>
            `;
        });
}

// Legacy function name for backward compatibility
function showRecordDetailsModal(recordId) {
    // Log the SHOW_DETAILS action
    if (typeof logShowDetails === 'function') {
        logShowDetails(recordId);
    }
    
    displayRecordDetailsModal(recordId);
}
