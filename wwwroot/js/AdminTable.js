// AdminTable.js - JavaScript functions for Admin Page Table Management

// Check for success message in URL parameters
window.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const successMessage = urlParams.get("successMessage");

  if (successMessage) {
    // Create and show success alert
    showSuccessAlert(successMessage);

    // Clean URL by removing the parameter
    const url = new URL(window.location);
    url.searchParams.delete("successMessage");
    window.history.replaceState({}, "", url);
  }

  // Setup lazy loading for accordion items
  setupAccordionLazyLoading();
});

function setupAccordionLazyLoading() {
  // Find all accordion items
  const accordionItems = document.querySelectorAll('.accordion-collapse');
  
  accordionItems.forEach(accordionItem => {
    // Add event listener for when accordion is about to show
    accordionItem.addEventListener('show.bs.collapse', function() {
      const accordionBody = this.querySelector('.accordion-body');
      
      // Get the record ID from the accordion button's data-record-id attribute
      const headingId = this.getAttribute('aria-labelledby');
      const accordionButton = document.getElementById(headingId).querySelector('button[data-record-id]');
      const recordId = accordionButton?.getAttribute('data-record-id');
      
      // Check if content has already been lazy loaded by checking for a marker class
      if (recordId && !accordionBody.classList.contains('ajax-loaded')) {
        // Mark as loading to prevent duplicate requests
        accordionBody.classList.add('ajax-loaded');
        
        // Store original content for debugging purposes
        const originalContent = accordionBody.innerHTML;
        
        // Show loading spinner immediately
        accordionBody.innerHTML = `
          <div class="d-flex justify-content-center align-items-center p-5">
            <div class="text-center">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="text-muted">Loading record details...</p>
            </div>
          </div>
        `;

        // Log the SHOW_DETAILS action
        if (typeof logShowDetails === 'function') {
          logShowDetails(recordId);
        }
        
        // Make AJAX call to get record details
        fetch("/Admin/GetRecordDetails?id=" + recordId)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to load record details");
            }
            return response.text();
          })
          .then((html) => {
            // Replace the content with AJAX loaded content
            accordionBody.innerHTML = html;
            
            // Apply translations to the newly loaded content
            setTimeout(() => {
              const currentLang = document.body.classList.contains('rtl') ? 'ar' : 'en';
              
              // Handle translatable labels with data-translate-key attribute within the element
              const translatableLabels = accordionBody.querySelectorAll('.translatable-label[data-translate-key]');
              
              // Get translations from the global object
              if (window.translations && window.translations[currentLang]) {
                translatableLabels.forEach(label => {
                  const translateKey = label.getAttribute('data-translate-key');
                  if (window.translations[currentLang][translateKey]) {
                    label.textContent = window.translations[currentLang][translateKey];
                  }
                });
              }
            }, 100);
          })
          .catch((error) => {
            // Show only error message, don't restore static content
            accordionBody.innerHTML = `
              <div class="d-flex justify-content-center align-items-center p-5">
                <div class="text-center">
                  <div class="alert alert-danger d-inline-block">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Failed to load record details</strong><br>
                    <small class="text-muted">Please try refreshing the page or contact support if the problem persists.</small>
                  </div>
                </div>
              </div>
            `;
            accordionBody.classList.remove('ajax-loaded');
          });
      }
    });
  });
}

function showSuccessAlert(message) {
  // Check if success alert already exists
  let existingAlert = document.querySelector(".alert-success");

  if (existingAlert) {
    // Update existing alert
    existingAlert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
  } else {
    // Create new success alert
    const alertContainer = document.querySelector(".container.mt-3");
    const newAlert = document.createElement("div");
    newAlert.className = "alert alert-success alert-dismissible fade show";
    newAlert.setAttribute("role", "alert");
    newAlert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

    // Insert at the beginning of the container
    alertContainer.insertBefore(newAlert, alertContainer.firstChild);
  }
}

function showAdminRecordDetails(recordId) {
  // Log the SHOW_DETAILS action
  if (typeof logShowDetails === 'function') {
    logShowDetails(recordId);
  }
  
  const detailsContainer = document.getElementById("adminDetails" + recordId);

  // Check if details are already loaded
  if (detailsContainer.innerHTML.includes("record-full-details")) {
    return; // Already loaded
  }

  // Show loading spinner
  detailsContainer.innerHTML = `
        <div class="text-center">
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            <p class="mt-2">Loading record details...</p>
        </div>
    `;

  // Make AJAX call to get record details
  fetch("/Admin/GetRecordDetails?id=" + recordId)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load record details");
      }
      return response.text();
    })
    .then((html) => {
      detailsContainer.innerHTML = html;
    })
    .catch((error) => {

      detailsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load record details. Please try again.
                </div>
            `;
    });
}

function toggleEditMode(recordId) {
  const form = document.getElementById("recordForm_" + recordId);
  if (!form) {
    return;
  }

  const inputs = form.querySelectorAll(
    'input:not([type="hidden"]):not(.contact-input), textarea:not(.contact-input), select:not(.contact-input)'
  );
  const editBtn = form.querySelector(".edit-btn");
  const saveBtn = form.querySelector(".save-btn");
  const cancelBtn = form.querySelector(".cancel-btn");

  const isCurrentlyEditing = editBtn.style.display === "none";

  // Toggle readonly and disabled state
  inputs.forEach((input, index) => {
    if (isCurrentlyEditing) {
      // Switch to view mode
      input.readOnly = true;
      input.disabled = true;
    } else {
      // Switch to edit mode
      input.readOnly = false;
      input.disabled = false;
    }
  });

  // Toggle file upload buttons state
  const wordUploadBtn = document.getElementById(`wordUploadBtn_${recordId}`);
  const pdfUploadBtn = document.getElementById(`pdfUploadBtn_${recordId}`);
  const wordFileInput = document.getElementById(`wordFile_${recordId}`);
  const pdfFileInput = document.getElementById(`pdfFile_${recordId}`);

  if (isCurrentlyEditing) {
    // Switch to view mode - disable file uploads
    if (wordUploadBtn) {
      wordUploadBtn.style.cursor = "not-allowed";
      wordUploadBtn.style.opacity = "0.6";
      wordUploadBtn.title = "Click Edit to enable file upload";
      wordUploadBtn.onclick = null;
    }
    if (pdfUploadBtn) {
      pdfUploadBtn.style.cursor = "not-allowed";
      pdfUploadBtn.style.opacity = "0.6";
      pdfUploadBtn.title = "Click Edit to enable file upload";
      pdfUploadBtn.onclick = null;
    }
    if (wordFileInput) wordFileInput.disabled = true;
    if (pdfFileInput) pdfFileInput.disabled = true;
  } else {
    // Switch to edit mode - enable file uploads
    if (wordUploadBtn) {
      wordUploadBtn.style.cursor = "pointer";
      wordUploadBtn.style.opacity = "1";
      wordUploadBtn.title = "Click to upload/change file";
      wordUploadBtn.onclick = function () {
        document.getElementById(`wordFile_${recordId}`).click();
      };
    }
    if (pdfUploadBtn) {
      pdfUploadBtn.style.cursor = "pointer";
      pdfUploadBtn.style.opacity = "1";
      pdfUploadBtn.title = "Click to upload/change file";
      pdfUploadBtn.onclick = function () {
        document.getElementById(`pdfFile_${recordId}`).click();
      };
    }
    if (wordFileInput) wordFileInput.disabled = false;
    if (pdfFileInput) pdfFileInput.disabled = false;
  }

  // Toggle button visibility
  if (isCurrentlyEditing) {
    // Currently in edit mode, switching to view mode
    editBtn.style.display = "inline-block";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";

    // Clear any pending file selections
    clearPendingFileSelections(recordId);

    // Reset form to original values if canceling
    location.reload(); // Simple solution to reset form
  } else {
    // Currently in view mode, switching to edit mode
    editBtn.style.display = "none";
    saveBtn.style.display = "inline-block";
    cancelBtn.style.display = "inline-block";
  }


}

// Make toggleEditMode globally accessible
window.toggleEditMode = toggleEditMode;

// Function to clear pending file selections
function clearPendingFileSelections(recordId) {
  const wordFileInput = document.getElementById(`wordFile_${recordId}`);
  const pdfFileInput = document.getElementById(`pdfFile_${recordId}`);
  const wordDisplay = document.getElementById(`wordDisplay_${recordId}`);
  const pdfDisplay = document.getElementById(`pdfDisplay_${recordId}`);

  if (wordFileInput) {
    wordFileInput.value = "";
  }
  if (pdfFileInput) {
    pdfFileInput.value = "";
  }
  if (wordDisplay) {
    wordDisplay.style.backgroundColor = "";
    wordDisplay.title = "";
  }
  if (pdfDisplay) {
    pdfDisplay.style.backgroundColor = "";
    pdfDisplay.title = "";
  }
}

function cancelEdit(recordId) {
  toggleEditMode(recordId);
}

function deleteRecord(recordId) {
  if (
    confirm(
      "Are you sure you want to delete this record? This action cannot be undone."
    )
  ) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/Admin/DeleteRecord";

    const token = document.querySelector(
      'input[name="__RequestVerificationToken"]'
    ).value;
    const tokenInput = document.createElement("input");
    tokenInput.type = "hidden";
    tokenInput.name = "__RequestVerificationToken";
    tokenInput.value = token;

    const recordIdInput = document.createElement("input");
    recordIdInput.type = "hidden";
    recordIdInput.name = "recordId";
    recordIdInput.value = recordId;

    form.appendChild(tokenInput);
    form.appendChild(recordIdInput);
    document.body.appendChild(form);
    form.submit();
  }
}

// Checkbox functionality
function toggleAllCheckboxes() {
  const masterCheckbox = document.getElementById("masterCheckbox");
  const recordCheckboxes = document.querySelectorAll(".record-checkbox");

  recordCheckboxes.forEach((checkbox) => {
    checkbox.checked = masterCheckbox.checked;
  });


    "Master checkbox toggled. All checkboxes set to:",
    masterCheckbox.checked
  ;
}

function handleRecordCheckbox() {
  const masterCheckbox = document.getElementById("masterCheckbox");
  const recordCheckboxes = document.querySelectorAll(".record-checkbox");

  // Check if all record checkboxes are checked
  const allChecked = Array.from(recordCheckboxes).every(
    (checkbox) => checkbox.checked
  );

  // Check if no record checkboxes are checked
  const noneChecked = Array.from(recordCheckboxes).every(
    (checkbox) => !checkbox.checked
  );

  if (allChecked) {
    masterCheckbox.checked = true;
    masterCheckbox.indeterminate = false;
  } else if (noneChecked) {
    masterCheckbox.checked = false;
    masterCheckbox.indeterminate = false;
  } else {
    masterCheckbox.checked = false;
    masterCheckbox.indeterminate = true;
  }


}

// Function to get selected record IDs
function getSelectedRecordIds() {
  const selectedCheckboxes = document.querySelectorAll(
    ".record-checkbox:checked"
  );
  const selectedIds = Array.from(selectedCheckboxes).map((checkbox) =>
    checkbox.getAttribute("data-record-id")
  );


  return selectedIds;
}

// Function to delete selected records
function deleteSelectedRecords() {
  const selectedIds = getSelectedRecordIds();

  if (selectedIds.length === 0) {
    alert("Please select at least one record to delete.");
    return;
  }

  const confirmMessage =
    selectedIds.length === 1
      ? "Are you sure you want to delete this record? This action cannot be undone."
      : `Are you sure you want to delete ${selectedIds.length} records? This action cannot be undone.`;

  if (confirm(confirmMessage)) {
    // Create form for multiple deletion
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/Admin/DeleteMultipleRecords";

    // Add anti-forgery token
    const token = document.querySelector(
      'input[name="__RequestVerificationToken"]'
    ).value;
    const tokenInput = document.createElement("input");
    tokenInput.type = "hidden";
    tokenInput.name = "__RequestVerificationToken";
    tokenInput.value = token;
    form.appendChild(tokenInput);

    // Add selected record IDs
    selectedIds.forEach((id) => {
      const idInput = document.createElement("input");
      idInput.type = "hidden";
      idInput.name = "recordIds";
      idInput.value = id;
      form.appendChild(idInput);
    });

    document.body.appendChild(form);
    form.submit();
  }
}

// Function to handle file selection (no upload yet)
function handleFileSelection(recordId, fileType, fileInput) {
  // Check if the form is in edit mode
  const form = document.getElementById("recordForm_" + recordId);
  if (!form) return;

  const editBtn = form.querySelector(".edit-btn");
  const isCurrentlyEditing = editBtn && editBtn.style.display === "none";

  if (!isCurrentlyEditing) {
    alert("Please click Edit button first to enable file upload.");
    fileInput.value = ""; // Clear the file input
    return;
  }

  const file = fileInput.files[0];
  if (!file) return;

  // Validate file type
  const allowedExtensions =
    fileType.toLowerCase() === "word" ? [".doc", ".docx"] : [".pdf"];

  const fileExtension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));
  if (!allowedExtensions.includes(fileExtension)) {
    alert(
      `Only ${allowedExtensions.join(
        ", "
      )} files are allowed for ${fileType} type.`
    );
    fileInput.value = "";
    return;
  }

  // Just show the selected file name in the display input
  const displayInput = document.getElementById(
    `${fileType}Display_${recordId}`
  );
  displayInput.value = file.name;
  displayInput.style.backgroundColor = "#fff3cd"; // Light yellow to indicate pending change
  displayInput.title = "File selected. Click Save to upload.";
}

// Function to upload attachments when Save is clicked
async function uploadPendingAttachments(recordId) {
  const wordFileInput = document.getElementById(`wordFile_${recordId}`);
  const pdfFileInput = document.getElementById(`pdfFile_${recordId}`);

  const promises = [];

  // Check if word file is selected
  if (wordFileInput && wordFileInput.files && wordFileInput.files.length > 0) {
    promises.push(uploadSingleAttachment(recordId, "word", wordFileInput));
  }

  // Check if pdf file is selected
  if (pdfFileInput && pdfFileInput.files && pdfFileInput.files.length > 0) {
    promises.push(uploadSingleAttachment(recordId, "pdf", pdfFileInput));
  }

  if (promises.length > 0) {
    try {
      const results = await Promise.all(promises);
      const failedUploads = results.filter((result) => !result.success);

      if (failedUploads.length > 0) {
        throw new Error(failedUploads.map((f) => f.message).join(", "));
      }

      return { success: true, message: "All files uploaded successfully." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  return { success: true, message: "No files to upload." };
}

// Function to upload a single attachment
async function uploadSingleAttachment(recordId, fileType, fileInput) {
  const file = fileInput.files[0];
  if (!file) return { success: true, message: "No file selected." };

  const formData = new FormData();
  formData.append("recordId", recordId);
  formData.append("fileType", fileType);
  formData.append("file", file);
  formData.append(
    "__RequestVerificationToken",
    document.querySelector('input[name="__RequestVerificationToken"]').value
  );

  try {
    const response = await fetch("/Admin/UpdateAttachment", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    
    // If PDF was successfully uploaded, clear the thumbnail cache
    if (data.success && fileType.toLowerCase() === 'pdf') {

      try {
        await clearThumbnailCacheForRecord(recordId);
      } catch (cacheError) {

        // Don't fail the whole operation if cache clearing fails
      }
    }
    
    return data;
  } catch (error) {
    return {
      success: false,
      message: `Error uploading ${fileType} file: ${error.message}`,
    };
  }
}

// Helper function to clear thumbnail cache for a specific record
async function clearThumbnailCacheForRecord(recordId) {
  const response = await fetch(`/api/pdf/clear-cache?recordId=${recordId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to clear cache: ${response.status}`);
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Unknown error clearing cache');
  }
  

  return result;
}

// Function to handle form submission with file uploads
async function handleFormSubmit(event, recordId) {
  event.preventDefault(); // Prevent default form submission

  const form = event.target;
  const saveBtn = form.querySelector(".save-btn");

  // Show loading state
  const originalSaveText = saveBtn.textContent;
  saveBtn.textContent = "Saving...";
  saveBtn.disabled = true;

  try {
    // First upload any pending attachments
    const uploadResult = await uploadPendingAttachments(recordId);

    if (!uploadResult.success) {
      alert("Error uploading files: " + uploadResult.message);
      return false;
    }

    // If file uploads successful, submit the form normally
    const formData = new FormData(form);

    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      // Set success message in TempData and reload
      const url = new URL(window.location);
      url.searchParams.set(
        "successMessage",
        `Record #${recordId} has been updated successfully!`
      );
      window.location.href = url.toString();
    } else {
      alert("Error saving record. Please try again.");
    }
  } catch (error) {

    alert("An error occurred while saving. Please try again.");
  } finally {
    // Restore button state
    saveBtn.textContent = originalSaveText;
    saveBtn.disabled = false;
  }

  return false; // Prevent default submission
}

// =============================================
// SEARCH FUNCTIONALITY
// =============================================

// Search functionality
function performSearch(searchTerm) {
  // Sync both search inputs
  document.getElementById("desktopSearchInput").value = searchTerm;
  document.getElementById("mobileSearchInput").value = searchTerm;

  // Update clear button visibility
  toggleClearButton("desktop");
  toggleClearButton("mobile");

  const accordionItems = document.querySelectorAll(
    "#regulationAccordion .accordion-item"
  );
  const searchTermLower = searchTerm.toLowerCase();

  // Get current filter settings
  const desktopDocumentFilter = document.getElementById("adminDocumentFilter");
  const mobileDocumentFilter = document.getElementById("mobileDocumentFilter");
  
  let selectedDocumentType = "all";
  if (desktopDocumentFilter && desktopDocumentFilter.offsetParent !== null) {
    // Desktop filter is visible
    selectedDocumentType = desktopDocumentFilter.value;
  } else if (mobileDocumentFilter && mobileDocumentFilter.offsetParent !== null) {
    // Mobile filter is visible
    selectedDocumentType = mobileDocumentFilter.value;
  } else if (desktopDocumentFilter) {
    // Fallback to desktop
    selectedDocumentType = desktopDocumentFilter.value;
  } else if (mobileDocumentFilter) {
    // Fallback to mobile
    selectedDocumentType = mobileDocumentFilter.value;
  }

  let visibleCount = 0;

  accordionItems.forEach(function (item) {
    const recordId =
      item.querySelector(".record-checkbox")?.getAttribute("data-record-id") ||
      "";
    const regulationNameElement = item.querySelector(".Regulation-Manual-size");
    const regulationName = regulationNameElement
      ? regulationNameElement.textContent.toLowerCase()
      : "";

    // Get document type for filtering
    const recordDocumentType = item.getAttribute("data-document-type") || "";

    // Check search criteria - support multi-word search
    let matchesSearch = true;
    if (searchTermLower !== "") {
      // Split search term by spaces and check if all words are found
      const searchWords = searchTermLower.split(/\s+/).filter(word => word.length > 0);
      const searchText = `${recordId} ${regulationName}`.toLowerCase();
      
      matchesSearch = searchWords.every(word => searchText.includes(word));
    }

    // Check document type filter
    const matchesFilter =
      selectedDocumentType === "all" ||
      recordDocumentType === selectedDocumentType;

    // Show only if both search and filter criteria match
    if (matchesSearch && matchesFilter) {
      item.style.display = "block";
      visibleCount++;
    } else {
      item.style.display = "none";
    }
  });

  // Show/hide "no results" message
  const hasActiveSearch = searchTermLower !== "";
  const hasActiveFilters = selectedDocumentType !== "all";
  showUnifiedNoResultsMessage(
    visibleCount === 0 && (hasActiveSearch || hasActiveFilters)
  );
}

// =============================================
// UNIFIED NO RESULTS MESSAGE FUNCTIONALITY
// =============================================

function showUnifiedNoResultsMessage(show = true) {
  let noResultsDiv = document.getElementById("unifiedNoResults");

  if (show) {
    if (!noResultsDiv) {
      noResultsDiv = document.createElement("div");
      noResultsDiv.id = "unifiedNoResults";
      noResultsDiv.className = "alert alert-info text-center mt-4";

      const accordionContainer = document.getElementById("regulationAccordion");
      if (accordionContainer) {
        accordionContainer.parentNode.appendChild(noResultsDiv);
      }
    }

    // Check if we have active search or filters
    const hasActiveSearch = hasActiveSearchTerm();
    const hasActiveFilters = hasActiveFilterSelection();

    let title = "";
    let message = "";
    let buttonHtml = "";

    if (hasActiveSearch && hasActiveFilters) {
      title = "No records found";
      message =
        "No records match your search criteria and filter selections. Try adjusting your search terms or filter criteria.";
      buttonHtml = `
        <button class="btn btn-secondary me-2" onclick="clearSearch()">
          <i class="fas fa-search me-2"></i>Clear Search
        </button>
        <button class="btn btn-secondary" onclick="resetAdminFilters()">
          <i class="fas fa-filter me-2"></i>Clear All Filters
        </button>
      `;
    } else if (hasActiveSearch) {
      title = "No results found";
      message =
        "No records match your search criteria. Try adjusting your search terms.";
      buttonHtml = `
        <button class="btn btn-secondary" onclick="clearSearch()">
          <i class="fas fa-times me-2"></i>Clear Search
        </button>
      `;
    } else if (hasActiveFilters) {
      title = "No records match the selected filters";
      message =
        "Try adjusting your filter criteria or clear all filters to see all records.";
      buttonHtml = `
        <button class="btn btn-secondary" onclick="resetAdminFilters()">
          <i class="fas fa-times me-2"></i>Clear All Filters
        </button>
      `;
    }

    noResultsDiv.innerHTML = `
      <i class="fas fa-search"></i> 
      <h5>${title}</h5>
      <p>${message}</p>
      ${buttonHtml}
    `;

    noResultsDiv.style.display = "block";
  } else {
    if (noResultsDiv) {
      noResultsDiv.style.display = "none";
    }
  }
}

function hideUnifiedNoResultsMessage() {
  showUnifiedNoResultsMessage(false);
}

// Helper function to check if there's an active search term
function hasActiveSearchTerm() {
  const desktopSearch = document.getElementById("desktopSearchInput");
  const mobileSearch = document.getElementById("mobileSearchInput");

  return (
    (desktopSearch && desktopSearch.value !== "") ||
    (mobileSearch && mobileSearch.value !== "")
  );
}

// Helper function to check if there are active filter selections
function hasActiveFilterSelection() {
  const desktopDocumentFilter = document.getElementById("adminDocumentFilter");
  const mobileDocumentFilter = document.getElementById("mobileDocumentFilter");

  return (
    (desktopDocumentFilter && desktopDocumentFilter.value !== "all") ||
    (mobileDocumentFilter && mobileDocumentFilter.value !== "all")
  );
}

function showNoResultsMessage(show) {
  // Use the unified message function instead
  showUnifiedNoResultsMessage(show);
}

function clearSearch() {
  document.getElementById("desktopSearchInput").value = "";
  document.getElementById("mobileSearchInput").value = "";

  // Hide clear buttons
  toggleClearButton("desktop");
  toggleClearButton("mobile");

  // Reapply filters (this will handle both search and document type filtering)
  applyAdminFilters();
}

// =============================================
// CLEAR BUTTON FUNCTIONALITY
// =============================================

// Toggle clear button visibility based on input content
function toggleClearButton(type) {
  const input = document.getElementById(type + "SearchInput");
  const clearBtn = document.getElementById(type + "ClearBtn");

  if (input && clearBtn) {
    if (input.value.trim() !== "") {
      clearBtn.style.display = "block";
    } else {
      clearBtn.style.display = "none";
    }
  }
}

// Clear search input and hide clear button
function clearSearchInput(type) {
  const input = document.getElementById(type + "SearchInput");
  const clearBtn = document.getElementById(type + "ClearBtn");

  if (input) {
    input.value = "";
    input.focus(); // Keep focus on input after clearing
  }

  if (clearBtn) {
    clearBtn.style.display = "none";
  }

  // Sync both inputs
  if (type === "desktop") {
    const mobileInput = document.getElementById("mobileSearchInput");
    const mobileClearBtn = document.getElementById("mobileClearBtn");
    if (mobileInput) mobileInput.value = "";
    if (mobileClearBtn) mobileClearBtn.style.display = "none";
  } else {
    const desktopInput = document.getElementById("desktopSearchInput");
    const desktopClearBtn = document.getElementById("desktopClearBtn");
    if (desktopInput) desktopInput.value = "";
    if (desktopClearBtn) desktopClearBtn.style.display = "none";
  }

  // Reapply filters (this handles both search and document type filtering)
  applyAdminFilters();
}

// Add search button click functionality
document.addEventListener("DOMContentLoaded", function () {
  // Add click event to search buttons
  const searchButtons = document.querySelectorAll(".search-and-filter-buttons");
  searchButtons.forEach((button) => {
    if (button.querySelector(".search-icon")) {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const searchInput = this.parentNode.querySelector('input[type="text"]');
        if (searchInput) {
          searchInput.focus();
        }
      });
    }
  });
});

// =============================================
// ACCORDION MANAGEMENT FUNCTIONALITY
// =============================================

// Function to close all open accordions
function closeAllAccordions() {

  
  // Get all accordion collapse elements
  const accordionCollapses = document.querySelectorAll('#regulationAccordion .accordion-collapse.show');
  
  accordionCollapses.forEach(function(collapse) {
    // Use Bootstrap's collapse API to hide the accordion
    const bsCollapse = bootstrap.Collapse.getInstance(collapse);
    if (bsCollapse) {
      bsCollapse.hide();
    } else {
      // If no Bootstrap instance exists, create one and hide it
      new bootstrap.Collapse(collapse, { toggle: false }).hide();
    }
  });
  

}

// =============================================
// COMBINED SEARCH AND FILTER FUNCTIONALITY
// =============================================

// Update search and apply filters
function updateSearchAndFilter(searchTerm, type) {
  // Update clear button visibility
  toggleClearButton(type);

  // Apply combined search and filter
  applyAdminFilters();
}

// =============================================
// DOCUMENT TYPE FILTER FUNCTIONALITY
// =============================================

// Apply admin filters based on document type
function applyAdminFilters() {


  // Close all open accordions before applying filters
  closeAllAccordions();

  // Get filter values from both desktop and mobile dropdowns
  const desktopDocumentFilter = document.getElementById("adminDocumentFilter");
  const mobileDocumentFilter = document.getElementById("mobileDocumentFilter");

  // Check which filter is currently visible/available
  let selectedDocumentType = "all";
  
  if (desktopDocumentFilter && desktopDocumentFilter.offsetParent !== null) {
    // Desktop filter is visible
    selectedDocumentType = desktopDocumentFilter.value;
  } else if (mobileDocumentFilter && mobileDocumentFilter.offsetParent !== null) {
    // Mobile filter is visible
    selectedDocumentType = mobileDocumentFilter.value;
  } else if (desktopDocumentFilter) {
    // Fallback to desktop
    selectedDocumentType = desktopDocumentFilter.value;
  } else if (mobileDocumentFilter) {
    // Fallback to mobile
    selectedDocumentType = mobileDocumentFilter.value;
  }

  // Get current search term
  const desktopSearchInput = document.getElementById("desktopSearchInput");
  const mobileSearchInput = document.getElementById("mobileSearchInput");
  
  let searchTerm = "";
  let originalSearchTerm = "";
  if (desktopSearchInput && desktopSearchInput.offsetParent !== null) {
    // Desktop search is visible
    originalSearchTerm = desktopSearchInput.value;
    searchTerm = desktopSearchInput.value.toLowerCase();
  } else if (mobileSearchInput && mobileSearchInput.offsetParent !== null) {
    // Mobile search is visible
    originalSearchTerm = mobileSearchInput.value;
    searchTerm = mobileSearchInput.value.toLowerCase();
  } else if (desktopSearchInput) {
    // Fallback to desktop
    originalSearchTerm = desktopSearchInput.value;
    searchTerm = desktopSearchInput.value.toLowerCase();
  } else if (mobileSearchInput) {
    // Fallback to mobile
    originalSearchTerm = mobileSearchInput.value;
    searchTerm = mobileSearchInput.value.toLowerCase();
  }

  // Sync both dropdowns
  if (desktopDocumentFilter && mobileDocumentFilter) {
    desktopDocumentFilter.value = selectedDocumentType;
    mobileDocumentFilter.value = selectedDocumentType;
  }

  // Sync both search inputs with original value (preserving spaces)
  if (desktopSearchInput && mobileSearchInput) {
    if (desktopSearchInput.offsetParent !== null) {
      // Desktop is visible, sync mobile with desktop
      mobileSearchInput.value = originalSearchTerm;
    } else if (mobileSearchInput.offsetParent !== null) {
      // Mobile is visible, sync desktop with mobile  
      desktopSearchInput.value = originalSearchTerm;
    }
  }

  const accordionItems = document.querySelectorAll(
    "#regulationAccordion .accordion-item"
  );
  let visibleCount = 0;

  accordionItems.forEach(function (item) {
    const recordDocumentType = item.getAttribute("data-document-type") || "";

    // Get record info for search
    const recordId =
      item.querySelector(".record-checkbox")?.getAttribute("data-record-id") ||
      "";
    const regulationNameElement = item.querySelector(".Regulation-Manual-size");
    const regulationName = regulationNameElement
      ? regulationNameElement.textContent.toLowerCase()
      : "";

    // Check search criteria - support multi-word search
    let matchesSearch = true;
    if (searchTerm !== "") {
      // Split search term by spaces and check if all words are found
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
      const searchText = `${recordId} ${regulationName}`.toLowerCase();
      
      matchesSearch = searchWords.every(word => searchText.includes(word));
    }

    // Check document type filter
    const matchesFilter =
      selectedDocumentType === "all" ||
      recordDocumentType === selectedDocumentType;

    // Show item if both search and filter criteria match
    if (matchesSearch && matchesFilter) {
      item.style.display = "block";
      visibleCount++;
    } else {
      item.style.display = "none";
    }
  });



  // Show/hide no results message
  const hasActiveFilters = selectedDocumentType !== "all";
  const hasActiveSearch = searchTerm !== "";

  if (visibleCount === 0 && (hasActiveFilters || hasActiveSearch)) {
    showUnifiedNoResultsMessage(true);
  } else {
    showUnifiedNoResultsMessage(false);
  }
}

// Reset admin filters
function resetAdminFilters() {
  // Reset dropdowns
  const desktopDocumentFilter = document.getElementById("adminDocumentFilter");
  const mobileDocumentFilter = document.getElementById("mobileDocumentFilter");

  if (desktopDocumentFilter) desktopDocumentFilter.value = "all";
  if (mobileDocumentFilter) mobileDocumentFilter.value = "all";

  // Apply filters to show all records
  applyAdminFilters();

  // Clear search if active
  clearSearch();
}

// Admin Page Search and Filter Functionality
document.addEventListener("DOMContentLoaded", function () {
  const desktopDocumentFilter = document.getElementById("adminDocumentFilter");
  const mobileDocumentFilter = document.getElementById("mobileDocumentFilter");

  // Fix for search input space issue and add proper event listeners
  const searchInputs = document.querySelectorAll('#desktopSearchInput, #mobileSearchInput');
  searchInputs.forEach(input => {
    if (input) {
      // Add input event listener with timeout (like searchFunctionality.js)
      let searchTimeout;
      input.addEventListener('input', function() {
        // Update clear button visibility
        const type = this.id.includes('desktop') ? 'desktop' : 'mobile';
        toggleClearButton(type);
        
        // Clear previous timeout and set new one
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          applyAdminFilters();
        }, 300); // Wait 300ms after user stops typing
      });
      
      // Add keypress event for Enter key
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          clearTimeout(searchTimeout);
          applyAdminFilters();
        }
      });
      
      // Ensure the input can receive focus and text properly
      input.addEventListener('focus', function() {
        this.style.pointerEvents = 'auto';
      });
    }
  });

  // Add event listeners for desktop document filter
  if (desktopDocumentFilter) {
    desktopDocumentFilter.addEventListener("change", function () {
      applyAdminFilters();
    });
  }

  // Add event listeners for mobile document filter
  if (mobileDocumentFilter) {
    mobileDocumentFilter.addEventListener("change", function () {
      applyAdminFilters();
    });
  }

  // Set default values
  if (desktopDocumentFilter) desktopDocumentFilter.value = "all";
  if (mobileDocumentFilter) mobileDocumentFilter.value = "all";
});

/**
 * Export all data to Excel file - shows modal for table selection
 */
function exportData() {

    
    // Show the modal
    const exportModal = new bootstrap.Modal(document.getElementById('exportModal'));
    exportModal.show();
}

/**
 * Confirm export with selected tables
 */
function confirmExport() {

    
    // Get selected tables
    const form = document.getElementById('exportForm');
    const selectedTables = [];
    const checkboxes = form.querySelectorAll('input[name="tables"]:checked');
    
    checkboxes.forEach(checkbox => {
        selectedTables.push(checkbox.value);
    });
    
    if (selectedTables.length === 0) {
        alert('Please select at least one table to export.');
        return;
    }
    

    
    // Show loading state
    const exportButton = document.getElementById('confirmExportBtn');
    const originalText = exportButton.innerHTML;
    exportButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Exporting...';
    exportButton.disabled = true;
    
    // Add selected tables as hidden inputs to the form
    const existingTableInputs = form.querySelectorAll('input[name="selectedTables"]');
    existingTableInputs.forEach(input => input.remove());
    
    selectedTables.forEach(table => {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'selectedTables';
        hiddenInput.value = table;
        form.appendChild(hiddenInput);
    });
    
    // Submit form
    form.submit();
    
    // Close modal and reset button after a delay
    setTimeout(() => {
        exportButton.innerHTML = originalText;
        exportButton.disabled = false;
        bootstrap.Modal.getInstance(document.getElementById('exportModal')).hide();
    }, 3000);
}

// Modal JavaScript for Select All functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle Select All checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    const tableCheckboxes = document.querySelectorAll('.table-checkbox');
    
    if (selectAllCheckbox && tableCheckboxes.length > 0) {
        selectAllCheckbox.addEventListener('change', function() {
            tableCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
        
        // Handle individual checkboxes
        tableCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // If any checkbox is unchecked, uncheck "Select All"
                if (!this.checked) {
                    selectAllCheckbox.checked = false;
                } else {
                    // If all checkboxes are checked, check "Select All"
                    const allChecked = Array.from(tableCheckboxes).every(cb => cb.checked);
                    selectAllCheckbox.checked = allChecked;
                }
            });
        });
    }
});
