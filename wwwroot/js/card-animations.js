src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"

function handleAction(action) {
    const actions = {
        download: 'Downloading document...',
        info: 'Showing information...',
        call: 'Initiating call...',
        read: 'Opening document for reading...',
        chat: 'Starting chat...'
    };
    
    // Visual feedback
    const button = event.target.closest('.action-btn');
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
    
    showToast(actions[action] || 'Action performed');
}

function toggleBookmark(bookmark) {
    bookmark.style.background = bookmark.style.background === 'rgb(255, 193, 7)' ? 
        'rgba(255, 255, 255, 0.9)' : '#ffc107';
    
    const isBookmarked = bookmark.style.background === 'rgb(255, 193, 7)';
    showToast(isBookmarked ? 'Document bookmarked!' : 'Bookmark removed');
}

function openPDFPreview() {
    try {
        // Get the clicked element and find the document icon
        const clickedElement = event ? event.target : null;
        const documentIcon = clickedElement ? clickedElement.closest('.document-icon') : document.querySelector('.document-icon');
        
        // Check if loading indicator exists before using it
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        
        // Add visual feedback to the document icon if it exists
        if (documentIcon) {
            documentIcon.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                documentIcon.style.transform = '';
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            }, 1000);
        }
        
        showToast('Loading PDF Preview...');
    } catch (error) {
        showToast('Error opening PDF preview');
    }
}

function testPdfApiDirect() {
    // Test the general API endpoint first
    fetch('/api/pdf/test')
        .then(response => {
            return response.json();
        })
        .then(data => {
            
            // Now test with a specific record ID
            testSpecificRecord();
        })
        
}


function clearThumbnailCache(recordId) {
    fetch(`/api/pdf/clear-cache?recordId=${recordId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(`Cache cleared for record ${recordId}`);
            
            // Reload the thumbnail for this record
            const thumbnail = document.querySelector(`[data-record-id="${recordId}"]`);
            if (thumbnail) {
                loadThumbnailForElement(thumbnail, recordId);
            }
        } else {
            showToast('Failed to clear cache');
        }
    })
    .catch(error => {
        showToast('Error clearing cache');
    });
}

function refreshThumbnail(recordId) {
    // Clear cache and reload thumbnail
    clearThumbnailCache(recordId);
}
// Updated function that works directly with the new PDF API
function loadAllThumbnails() {
    const thumbnails = document.querySelectorAll('.pdf-thumbnail');
    
    if (thumbnails.length === 0) {
        return;
    }
    
    thumbnails.forEach((thumbnail, index) => {
        const recordId = thumbnail.dataset.recordId;
        const loadingElement = document.getElementById(`loading-${recordId}`);
        
        if (!recordId) {
            return;
        }
        
        // UPDATED: Direct call to new PDF API endpoint
        const thumbnailUrl = `/api/pdf/thumbnail?recordId=${recordId}`;
        
        // Set the image source directly - no intermediate API call needed
        thumbnail.src = thumbnailUrl;
        
        thumbnail.onload = function() {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            thumbnail.style.display = 'block';
            thumbnail.style.opacity = '1';
        };
        
        thumbnail.onerror = function() {
            if (loadingElement) {
                loadingElement.innerHTML = `
                    <i class="fas fa-file-pdf" style="font-size: 48px; color: #dc3545;"></i>
                    <br><small>No PDF Available</small>
                `;
                loadingElement.title = 'PDF thumbnail unavailable';
            }
        };
    });
}

// function loadAllThumbnails() {
//     console.log('loadAllThumbnails() called');
//     const thumbnails = document.querySelectorAll('.pdf-thumbnail');
//     console.log('Found thumbnails:', thumbnails.length);
    
//     if (thumbnails.length === 0) {
//         console.warn('No elements with class "pdf-thumbnail" found!');
//         return;
//     }
    
//     thumbnails.forEach((thumbnail, index) => {
//         const recordId = thumbnail.dataset.recordId;
//         const loadingElement = document.getElementById(`loading-${recordId}`);
        
//         console.log(`Processing thumbnail ${index + 1}:`, {
//             recordId: recordId,
//             hasLoadingElement: !!loadingElement,
//             thumbnailElement: thumbnail
//         });
        
//         if (!recordId) {
//             console.warn('No record ID found for thumbnail', thumbnail);
//             return;
//         }
        
//         console.log(`Fetching attachment ID for record: ${recordId}`);
        
//         // First get the attachment ID for this record
//         fetch(`/Home/GetAttachmentId?recordId=${recordId}`)
//             .then(response => {
//                 console.log(`Response status for record ${recordId}:`, response.status);
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 console.log(`Attachment data for record ${recordId}:`, data);
                
//                 if (data.success && data.attachmentId) {
//                     const thumbnailUrl = `/api/pdf/thumbnail/${data.attachmentId}`;
//                     console.log(`Loading thumbnail from: ${thumbnailUrl}`);
                    
//                     // Load thumbnail using attachment ID
//                     thumbnail.src = `/api/pdf/thumbnail?recordId=${recordId}`;
//                     // thumbnail.src = thumbnailUrl;
                    
//                     thumbnail.onload = function() {
//                         console.log(`Thumbnail loaded successfully for record ${recordId}`);
//                         if (loadingElement) {
//                             loadingElement.style.display = 'none';
//                         }
//                         thumbnail.style.display = 'block';
//                         thumbnail.style.opacity = '1';
//                     };
                    
//                     thumbnail.onerror = function() {
//                         console.error(`Failed to load thumbnail for record ${recordId} from ${thumbnailUrl}`);
//                         if (loadingElement) {
//                             loadingElement.innerHTML = '<i class="fas fa-file-pdf" style="font-size: 48px; color: #ccc;"></i>';
//                             loadingElement.title = 'PDF thumbnail unavailable';
//                         }
//                     };
//                 } else {
//                     console.info(`No PDF attachment found for record ${recordId}:`, data);
//                     if (loadingElement) {
//                         loadingElement.innerHTML = '<i class="fas fa-file" style="font-size: 48px; color: #ccc;"></i>';
//                         loadingElement.title = 'No PDF available';
//                     }
//                 }
//             })
//             .catch(error => {
//                 console.error('Error loading thumbnail for record', recordId, ':', error);
//                 if (loadingElement) {
//                     loadingElement.innerHTML = '<i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #dc3545;"></i>';
//                     loadingElement.title = 'Error loading thumbnail';
//                 }
//             });
//     });
// }

// NEW FUNCTION: Retry loading a specific thumbnail
function retryThumbnail(recordId) {
    const thumbnail = document.getElementById(`thumbnail-${recordId}`);
    const loadingElement = document.getElementById(`loading-${recordId}`);
    
    if (thumbnail && loadingElement) {
        loadingElement.style.display = 'flex';
        loadingElement.innerHTML = '<div class="spinner"></div>';
        thumbnail.style.display = 'none';
        
        // Retry the load process
        loadAllThumbnails();
    }
}

function showToast(message) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2c3e50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Responsive behavior for orientation changes
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        // Recalculate scaling if needed
        updateCardScale();
    }, 500);
});

// Function to update card scale based on screen size
function updateCardScale() {
    const card = document.querySelector('.document-card');
    const screenWidth = window.innerWidth;
    
    let scale = 1;
    if (screenWidth <= 400) scale = 0.5;
    else if (screenWidth <= 576) scale = 0.6;
    else if (screenWidth <= 768) scale = 0.7;
    else if (screenWidth <= 992) scale = 0.8;
    else if (screenWidth <= 1200) scale = 0.9;
    
    card.style.setProperty('--card-scale', scale);
}

// Touch support for mobile devices
document.addEventListener('touchstart', function() {}, {passive: true});

// Initialize card scale on load
document.addEventListener('DOMContentLoaded', function() {
    
    // Test the API first
    testPdfApiDirect();
    
    // Initialize card scale
    updateCardScale();
    
    // Load thumbnails after a short delay to ensure DOM is fully ready
    setTimeout(() => {loadAllThumbnails()});
    }, 100);
// document.addEventListener('DOMContentLoaded', function() {
//     updateCardScale();
// },);

// Update scale on window resize
window.addEventListener('resize', updateCardScale);