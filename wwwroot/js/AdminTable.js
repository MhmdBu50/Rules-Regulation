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
});

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
      console.error("Error loading record details:", error);
      detailsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load record details. Please try again.
                </div>
            `;
    });
}

function toggleEditMode(recordId) {
  console.log("Toggle edit mode called for record ID:", recordId);

  const form = document.getElementById("recordForm_" + recordId);
  if (!form) {
    console.error("Form not found for record ID:", recordId);
    return;
  }

  console.log("Form found:", form);

  const inputs = form.querySelectorAll(
    'input:not([type="hidden"]):not(.contact-input), textarea:not(.contact-input), select:not(.contact-input)'
  );
  const editBtn = form.querySelector(".edit-btn");
  const saveBtn = form.querySelector(".save-btn");
  const cancelBtn = form.querySelector(".cancel-btn");

  console.log("Found inputs:", inputs.length);
  console.log("Edit button:", editBtn);
  console.log("Save button:", saveBtn);
  console.log("Cancel button:", cancelBtn);

  const isCurrentlyEditing = editBtn.style.display === "none";
  console.log("Is currently editing:", isCurrentlyEditing);

  // Toggle readonly and disabled state
  inputs.forEach((input, index) => {
    console.log("Processing input", index, ":", input);
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

  console.log("Toggle edit mode completed");
}

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

  console.log(
    "Master checkbox toggled. All checkboxes set to:",
    masterCheckbox.checked
  );
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

  console.log("Record checkbox changed. Master checkbox state updated.");
}

// Function to get selected record IDs
function getSelectedRecordIds() {
  const selectedCheckboxes = document.querySelectorAll(
    ".record-checkbox:checked"
  );
  const selectedIds = Array.from(selectedCheckboxes).map((checkbox) =>
    checkbox.getAttribute("data-record-id")
  );

  console.log("Selected record IDs:", selectedIds);
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
    return data;
  } catch (error) {
    return {
      success: false,
      message: `Error uploading ${fileType} file: ${error.message}`,
    };
  }
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
    console.error("Error:", error);
    alert("An error occurred while saving. Please try again.");
  } finally {
    // Restore button state
    saveBtn.textContent = originalSaveText;
    saveBtn.disabled = false;
  }

  return false; // Prevent default submission
}
