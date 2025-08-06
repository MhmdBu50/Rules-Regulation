/**
 * Search Functionality JavaScript Module
 * Contains all search-related functionality for the home page
 */

// Search functionality
let searchTimeout;

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    
    if (searchInput && clearBtn) {
        // Show/hide clear button based on input content
        function toggleClearButton() {
            if (searchInput.value.trim() !== '') {
                clearBtn.classList.remove('d-none');
            } else {
                clearBtn.classList.add('d-none');
            }
        }

        searchInput.addEventListener('input', function() {
            toggleClearButton();
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300); // Wait 300ms after user stops typing
        });

        // Clear button functionality
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            clearBtn.classList.add('d-none');
            performSearch(''); // Show all cards
        });

        // Also search on Enter key press
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                performSearch(this.value);
            }
        });

        // Initial check for clear button visibility
        toggleClearButton();
    }
}

function performSearch(searchTerm) {
    const cards = document.querySelectorAll('.medium-card');
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch === '') {
        // Show all cards if search is empty
        cards.forEach(card => {
            card.style.display = 'block';
        });
        updateSearchResults(cards.length, cards.length);
        return;
    }

    let visibleCount = 0;
    cards.forEach(card => {
        const title = card.querySelector('.card-title');
        const description = card.querySelector('.card-text, .description, .notes');
        
        let searchText = '';
        if (title) searchText += title.textContent.toLowerCase() + ' ';
        if (description) searchText += description.textContent.toLowerCase() + ' ';

        // Check if search term matches regulation name or description
        if (searchText.includes(trimmedSearch)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    updateSearchResults(visibleCount, cards.length);
}

function updateSearchResults(visible, total) {
    // You can add a results counter here if needed
}

function restoreSearchFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    if (searchTerm) {
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('searchClearBtn');
        if (searchInput) {
            searchInput.value = searchTerm;
            // Show clear button if there's a search term
            if (clearBtn && searchTerm.trim() !== '') {
                clearBtn.classList.remove('d-none');
            }
            // Perform the search to show filtered results immediately
            performSearch(searchTerm);
        }
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    restoreSearchFromURL();
});

// Export functions for use in other modules if needed
window.searchModule = {
    initializeSearch,
    performSearch,
    restoreSearchFromURL
};
