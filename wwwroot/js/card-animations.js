src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"
// Sample PDF URL - replace with your actual PDF file path
const PDF_URL = 'https://www.iau.edu.sa/sites/default/files/resources/user_guide_for_student_information_system_0.pdf';

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
    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';
    
    // Add visual feedback to the document icon
    const documentIcon = document.querySelector('.document-icon');
    documentIcon.style.transform = 'scale(0.95)';
    
    // Simulate loading time and open PDF
    setTimeout(() => {
        try {
            // Open PDF in new tab
            const newWindow = window.open(PDF_URL, '_blank');
            
            // Check if popup was blocked
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                showToast('Popup blocked. Please allow popups for this site.');
                // Fallback: create a download link
                const link = document.createElement('a');
                link.href = PDF_URL;
                link.download = 'document.pdf';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                showToast('PDF preview opened in new tab');
            }
        } catch (error) {
            console.error('Error opening PDF:', error);
            showToast('Error opening PDF preview');
        }
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        
        // Reset document icon transform
        documentIcon.style.transform = '';
    }, 1000);
}

function loadAllThumbnails() {
    console.log('loadAllThumbnails() called');
    const thumbnails = document.querySelectorAll('.pdf-thumbnail');
    console.log('Found thumbnails:', thumbnails.length);
    
    if (thumbnails.length === 0) {
        console.warn('No elements with class "pdf-thumbnail" found!');
        return;
    }
    
    thumbnails.forEach((thumbnail, index) => {
        const recordId = thumbnail.dataset.recordId;
        const loadingElement = document.getElementById(`loading-${recordId}`);
        
        console.log(`Processing thumbnail ${index + 1}:`, {
            recordId: recordId,
            hasLoadingElement: !!loadingElement,
            thumbnailElement: thumbnail
        });
        
        if (!recordId) {
            console.warn('No record ID found for thumbnail', thumbnail);
            return;
        }
        
        console.log(`Fetching attachment ID for record: ${recordId}`);
        
        // First get the attachment ID for this record
        fetch(`/Home/GetAttachmentId?recordId=${recordId}`)
            .then(response => {
                console.log(`Response status for record ${recordId}:`, response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`Attachment data for record ${recordId}:`, data);
                
                if (data.success && data.attachmentId) {
                    const thumbnailUrl = `/api/pdf/thumbnail/${data.attachmentId}`;
                    console.log(`Loading thumbnail from: ${thumbnailUrl}`);
                    
                    // Load thumbnail using attachment ID
                    thumbnail.src = thumbnailUrl;
                    
                    thumbnail.onload = function() {
                        console.log(`Thumbnail loaded successfully for record ${recordId}`);
                        if (loadingElement) {
                            loadingElement.style.display = 'none';
                        }
                        thumbnail.style.display = 'block';
                        thumbnail.style.opacity = '1';
                    };
                    
                    thumbnail.onerror = function() {
                        console.error(`Failed to load thumbnail for record ${recordId} from ${thumbnailUrl}`);
                        if (loadingElement) {
                            loadingElement.innerHTML = '<i class="fas fa-file-pdf" style="font-size: 48px; color: #ccc;"></i>';
                            loadingElement.title = 'PDF thumbnail unavailable';
                        }
                    };
                } else {
                    console.info(`No PDF attachment found for record ${recordId}:`, data);
                    if (loadingElement) {
                        loadingElement.innerHTML = '<i class="fas fa-file" style="font-size: 48px; color: #ccc;"></i>';
                        loadingElement.title = 'No PDF available';
                    }
                }
            })
            .catch(error => {
                console.error('Error loading thumbnail for record', recordId, ':', error);
                if (loadingElement) {
                    loadingElement.innerHTML = '<i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #dc3545;"></i>';
                    loadingElement.title = 'Error loading thumbnail';
                }
            });
    });
}

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
    console.log('DOM loaded, initializing...');
    
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