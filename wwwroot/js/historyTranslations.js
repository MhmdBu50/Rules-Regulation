// ==================== HISTORY PAGE TRANSLATIONS SUPPORT ====================
// This file provides additional translation support specifically for the history page
// It acts as a backup system and provides standalone functionality for history translations
// 
// Purpose: Ensure history page translations work even if main translation system fails
// Benefits: Modular design, standalone functionality, enhanced reliability

// ==================== MAIN TRANSLATION APPLICATION FUNCTION ====================
// Apply translations to all history page elements when called
// This function can be used independently or as backup to main translation system
function applyHistoryTranslations() {
    // Get current language setting from localStorage with fallback to English
    // localStorage is used for persistence across browser sessions
    const currentLanguage = localStorage.getItem('websiteLanguage') || 'en';
    
    // Access global translations object with safety checks
    // Uses window.translations if available, otherwise empty object as fallback
    const trans = window.translations && window.translations[currentLanguage] ? window.translations[currentLanguage] : {};
    
    // ==================== UPDATE HEADER ELEMENTS ====================
    // Update main page title with translated text
    const titleSpan = document.querySelector('#history-container .fw-bold');
    if (titleSpan) {
        // Apply translation with English fallback for reliability
        titleSpan.textContent = trans['history-activity-title'] || 'Your Activity History';
    }
    
    // Update page description/subtitle with icon preservation
    const descP = document.querySelector('#history-container .opacity-75');
    if (descP) {
        // Maintain Font Awesome icon while updating text content
        descP.innerHTML = `<i class="fas fa-info-circle me-2"></i>${trans['history-track-activity'] || 'Track your recent views and downloads'}`;
    }
    
    // ==================== UPDATE VIEW TOGGLE BUTTONS ====================
    // Update table view button text while preserving icon
    const tableBtn = document.getElementById('table-view-btn');
    if (tableBtn) {
        tableBtn.innerHTML = `<i class="fas fa-table me-1"></i>${trans['history-table-btn'] || 'Table'}`;
    }
    
    // Update card view button text while preserving icon
    const cardBtn = document.getElementById('card-view-btn');
    if (cardBtn) {
        cardBtn.innerHTML = `<i class="fas fa-th-large me-1"></i>${trans['history-cards-btn'] || 'Cards'}`;
    }
    
    // ==================== UPDATE TABLE HEADERS ====================
    // Update table column headers if table is currently visible
    // Only updates if all 4 expected headers are found (safety check)
    const tableHeaders = document.querySelectorAll('#history-container .history-table thead th');
    if (tableHeaders.length >= 4) {
        // Update each header with icon and translated text
        tableHeaders[0].innerHTML = `<i class="fas fa-file-alt me-2"></i>${trans['history-record-name'] || 'Record Name'}`;
        tableHeaders[1].innerHTML = `<i class="fas fa-bolt me-2"></i>${trans['history-all-actions'] || 'All Actions'}`;
        tableHeaders[2].innerHTML = `<i class="fas fa-star me-2"></i>${trans['history-last-action'] || 'Last Action'}`;
        tableHeaders[3].innerHTML = `<i class="fas fa-clock me-2"></i>${trans['history-timestamp'] || 'Timestamp'}`;
    }
}

// ==================== LANGUAGE CHANGE EVENT LISTENER ====================
// Listen for global language change events dispatched by the main translation system
// This provides automatic translation updates when user switches language
document.addEventListener('languageChanged', function(event) {
    // Debug logging to help troubleshoot translation issues
    // Can be removed in production or kept for debugging purposes
    console.log('Language changed to:', event.detail.language);
    
    // Check if history page is currently displayed before applying translations
    // This prevents unnecessary processing when history page is not active
    const historyContainer = document.getElementById('history-container');
    if (historyContainer) {
        // Log when applying translations for debugging
        console.log('Applying history translations');
        
        // Use setTimeout to ensure DOM is ready after language change
        // This delay prevents race conditions with other translation updates
        setTimeout(() => {
            // Apply translation updates to all history page elements
            applyHistoryTranslations();
            
            // Re-render table view if it's currently visible to update dynamic content
            // This ensures action badges and other generated content are translated
            const tableContainer = document.getElementById('table-container');
            if (tableContainer && tableContainer.style.display !== 'none' && typeof renderTableView === 'function') {
                renderTableView(); // Call main function if available
            }
        }, 100); // 100ms delay to ensure DOM stability
    }
});

// ==================== GLOBAL FUNCTION EXPORT ====================
// Make the translation function available globally for direct calls
// This allows other parts of the application to trigger translations manually
if (typeof window !== 'undefined') {
    // Export to global scope for accessibility from other scripts
    window.applyHistoryTranslations = applyHistoryTranslations;
}
