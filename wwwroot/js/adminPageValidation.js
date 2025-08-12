// Real-time validation for AdminPage.cshtml
// Handles validation for English and Arabic text fields

document.addEventListener('DOMContentLoaded', function () {
  // Arabic validation pattern - includes Arabic letters, punctuation, and common symbols
  const arabicPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9\s\.\,\:\;\!\?\@\#\$\%\^\&\*\(\)\[\]\{\}\/\\\<\>\-\_\+\=\"\'\|،؟؛\n\r]+$/;

  // English validation function
  function validateEnglishField(input, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    const englishPattern = /^[a-zA-Z0-9\s\-.,'()&]+$/;
    
    if (input.value.trim() && !englishPattern.test(input.value)) {
      if (errorElement) {
        errorElement.textContent = "This field must contain only English text.";
        errorElement.style.display = "block";
      }
      // Add error styling to input
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      return false;
    } else {
      if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = "none";
      }
      // Add success styling to input if it has content
      if (input.value.trim()) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
      } else {
        input.classList.remove('is-valid', 'is-invalid');
      }
      return true;
    }
  }

  // Arabic validation function
  function validateArabicField(input, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    
    if (input.value.trim() && !arabicPattern.test(input.value)) {
      if (errorElement) {
        errorElement.textContent = "هذا الحقل يجب أن يحتوي على نص عربي فقط.";
        errorElement.style.display = "block";
        errorElement.setAttribute('dir', 'rtl');
      }
      // Add error styling to input
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      return false;
    } else {
      if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = "none";
      }
      // Add success styling to input if it has content
      if (input.value.trim()) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
      } else {
        input.classList.remove('is-valid', 'is-invalid');
      }
      return true;
    }
  }

  // Function to add validation to a specific record form
  function addValidationToRecord(recordId) {
    console.log('Initializing validation for record:', recordId);
    const formId = `recordForm_${recordId}`;
    const form = document.getElementById(formId);
    
    if (!form) {
      console.log('Form not found:', formId);
      return;
    }

    // Remove any existing validation markers to prevent duplicate listeners
    if (form.hasAttribute('data-validation-initialized')) {
      console.log('Validation already initialized for record:', recordId);
      return; // Already initialized
    }
    
    console.log('Adding validation to record:', recordId);
    // Mark form as having validation initialized
    form.setAttribute('data-validation-initialized', 'true');

    // Get English fields
    const regulationNameEn = form.querySelector('textarea[name="regulationName"]');
    const descriptionEn = form.querySelector('textarea[name="description"]');
    const approvingEntityEn = form.querySelector('input[name="approvingEntity"]');
    const notesEn = form.querySelector('input[name="notes"]');

    // Get Arabic fields
    const regulationNameAr = form.querySelector('textarea[name="regulationNameAr"]');
    const descriptionAr = form.querySelector('textarea[name="descriptionAr"]');
    const approvingEntityAr = form.querySelector('input[name="approvingEntityAr"]');
    const notesAr = form.querySelector('input[name="notesAr"]');

    // Create error elements if they don't exist
    const createErrorElement = (fieldElement, errorId) => {
      if (!fieldElement) return;
      
      let errorElement = document.getElementById(errorId);
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'text-danger mt-1';
        errorElement.style.display = 'none';
        
        // Create error container for better spacing
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.appendChild(errorElement);
        
        fieldElement.parentNode.appendChild(errorContainer);
      }
    };

    // Create error elements for English fields
    if (regulationNameEn) createErrorElement(regulationNameEn, `regulationNameEnError_${recordId}`);
    if (descriptionEn) createErrorElement(descriptionEn, `descriptionEnError_${recordId}`);
    if (approvingEntityEn) createErrorElement(approvingEntityEn, `approvingEntityEnError_${recordId}`);
    if (notesEn) createErrorElement(notesEn, `notesEnError_${recordId}`);

    // Create error elements for Arabic fields
    if (regulationNameAr) createErrorElement(regulationNameAr, `regulationNameArError_${recordId}`);
    if (descriptionAr) createErrorElement(descriptionAr, `descriptionArError_${recordId}`);
    if (approvingEntityAr) createErrorElement(approvingEntityAr, `approvingEntityArError_${recordId}`);
    if (notesAr) createErrorElement(notesAr, `notesArError_${recordId}`);

    // Add real-time validation for English fields
    if (regulationNameEn) {
      regulationNameEn.addEventListener('input', function() {
        if (!this.disabled && !this.readOnly) {
          validateEnglishField(this, `regulationNameEnError_${recordId}`);
        }
      });
    }

    if (descriptionEn) {
      descriptionEn.addEventListener('input', function() {
        if (!this.disabled && !this.readOnly) {
          validateEnglishField(this, `descriptionEnError_${recordId}`);
        }
      });
    }

    if (approvingEntityEn) {
      approvingEntityEn.addEventListener('input', function() {
        if (!this.disabled && !this.readOnly) {
          validateEnglishField(this, `approvingEntityEnError_${recordId}`);
        }
      });
    }

    if (notesEn) {
      notesEn.addEventListener('input', function() {
        if (!this.disabled && !this.readOnly) {
          validateEnglishField(this, `notesEnError_${recordId}`);
        }
      });
    }

    // Add real-time validation for Arabic fields
    if (regulationNameAr) {
      regulationNameAr.addEventListener('input', function() {
        if (!this.disabled && !this.readOnly) {
          validateArabicField(this, `regulationNameArError_${recordId}`);
        }
      });
    }

    if (descriptionAr) {
      descriptionAr.addEventListener('input', function() {
        if (!this.disabled && !this.readOnly) {
          validateArabicField(this, `descriptionArError_${recordId}`);
        }
      });
    }

    if (approvingEntityAr) {
      approvingEntityAr.addEventListener('input', function() {
        if (!this.disabled && !this.readOnly) {
          validateArabicField(this, `approvingEntityArError_${recordId}`);
        }
      });
    }

    if (notesAr) {
      notesAr.addEventListener('input', function() {
        if (!this.disabled && !this.readOnly) {
          validateArabicField(this, `notesArError_${recordId}`);
        }
      });
    }

    // Form submission validation
    form.addEventListener('submit', function(e) {
      let isValid = true;

      // Validate English fields if they have content and are enabled
      if (regulationNameEn && !regulationNameEn.disabled && regulationNameEn.value.trim()) {
        if (!validateEnglishField(regulationNameEn, `regulationNameEnError_${recordId}`)) {
          isValid = false;
        }
      }

      if (descriptionEn && !descriptionEn.disabled && descriptionEn.value.trim()) {
        if (!validateEnglishField(descriptionEn, `descriptionEnError_${recordId}`)) {
          isValid = false;
        }
      }

      if (approvingEntityEn && !approvingEntityEn.disabled && approvingEntityEn.value.trim()) {
        if (!validateEnglishField(approvingEntityEn, `approvingEntityEnError_${recordId}`)) {
          isValid = false;
        }
      }

      if (notesEn && !notesEn.disabled && notesEn.value.trim()) {
        if (!validateEnglishField(notesEn, `notesEnError_${recordId}`)) {
          isValid = false;
        }
      }

      // Validate Arabic fields if they have content and are enabled
      if (regulationNameAr && !regulationNameAr.disabled && regulationNameAr.value.trim()) {
        if (!validateArabicField(regulationNameAr, `regulationNameArError_${recordId}`)) {
          isValid = false;
        }
      }

      if (descriptionAr && !descriptionAr.disabled && descriptionAr.value.trim()) {
        if (!validateArabicField(descriptionAr, `descriptionArError_${recordId}`)) {
          isValid = false;
        }
      }

      if (approvingEntityAr && !approvingEntityAr.disabled && approvingEntityAr.value.trim()) {
        if (!validateArabicField(approvingEntityAr, `approvingEntityArError_${recordId}`)) {
          isValid = false;
        }
      }

      if (notesAr && !notesAr.disabled && notesAr.value.trim()) {
        if (!validateArabicField(notesAr, `notesArError_${recordId}`)) {
          isValid = false;
        }
      }

      if (!isValid) {
        e.preventDefault();
        alert('Please ensure all fields contain only the appropriate script before submitting.');
      }
    });
  }

  // Function to clear validation styles from a record
  function clearValidationStyles(recordId) {
    const formId = `recordForm_${recordId}`;
    const form = document.getElementById(formId);
    
    if (!form) return;

    // Remove validation marker so it can be re-initialized
    form.removeAttribute('data-validation-initialized');

    // Remove validation classes from all form controls
    const formControls = form.querySelectorAll('.form-control');
    formControls.forEach(control => {
      control.classList.remove('is-valid', 'is-invalid');
    });

    // Hide all error messages
    const errorElements = form.querySelectorAll('.text-danger');
    errorElements.forEach(errorElement => {
      errorElement.textContent = "";
      errorElement.style.display = "none";
    });
  }

  // Initialize validation for all existing record forms
  function initializeAllValidations() {
    const forms = document.querySelectorAll('[id^="recordForm_"]');
    forms.forEach(form => {
      const recordId = form.id.replace('recordForm_', '');
      addValidationToRecord(recordId);
    });
  }

  // Initialize validation on page load
  initializeAllValidations();

  // Make the functions available globally for dynamically added forms
  window.addValidationToRecord = addValidationToRecord;
  window.clearValidationStyles = clearValidationStyles;
});
