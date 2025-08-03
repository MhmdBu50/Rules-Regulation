function confirmCancel() {
  if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
    document.querySelector('form').reset();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Arabic validation pattern - includes Arabic letters, punctuation, and common symbols
  const arabicPattern = /^[\u0600-\u06FF\s\u060C\u061B\u061F\u0640]*$/;
  
  // Arabic validation function
  function validateArabicField(input, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    if (input.value.trim() && !arabicPattern.test(input.value)) {
      errorElement.textContent = "This field must contain only Arabic text.";
      errorElement.style.display = "block";
      return false;
    } else {
      errorElement.textContent = "";
      errorElement.style.display = "none";
      return true;
    }
  }

  // Get all Arabic input fields
  const regulationNameAr = document.getElementById('regulationNameAr');
  const approvingEntityAr = document.getElementById('ApprovingEntityAr');
  const descriptionAr = document.getElementById('DescriptionAr');
  const notesAr = document.getElementById('notesAr');

  // Real-time validation for Arabic fields
  if (regulationNameAr) {
    regulationNameAr.addEventListener('input', function() {
      validateArabicField(this, 'regulationNameArError');
    });
  }

  if (approvingEntityAr) {
    approvingEntityAr.addEventListener('input', function() {
      validateArabicField(this, 'approvingEntityArError');
    });
  }

  if (descriptionAr) {
    descriptionAr.addEventListener('input', function() {
      validateArabicField(this, 'descriptionArError');
    });
  }

  if (notesAr) {
    notesAr.addEventListener('input', function() {
      validateArabicField(this, 'notesArError');
    });
  }

  // Form submission validation
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      let isValid = true;
      
      // Validate all Arabic fields before submission
      if (regulationNameAr && regulationNameAr.value.trim()) {
        if (!validateArabicField(regulationNameAr, 'regulationNameArError')) {
          isValid = false;
        }
      }
      
      if (approvingEntityAr && approvingEntityAr.value.trim()) {
        if (!validateArabicField(approvingEntityAr, 'approvingEntityArError')) {
          isValid = false;
        }
      }
      
      if (descriptionAr && descriptionAr.value.trim()) {
        if (!validateArabicField(descriptionAr, 'descriptionArError')) {
          isValid = false;
        }
      }
      
      if (notesAr && notesAr.value.trim()) {
        if (!validateArabicField(notesAr, 'notesArError')) {
          isValid = false;
        }
      }

      // Check for section selection if section checkboxes exist
      const checkboxes = document.querySelectorAll('.section-checkbox');
      if (checkboxes.length > 0) {
        const oneChecked = Array.from(checkboxes).some(cb => cb.checked);
        if (!oneChecked) {
          const sectionError = document.getElementById('sectionError');
          if (sectionError) {
            sectionError.textContent = "Please select at least one section.";
          }
          isValid = false;
        } else {
          const sectionError = document.getElementById('sectionError');
          if (sectionError) {
            sectionError.textContent = "";
          }
        }
      }

      if (!isValid) {
        e.preventDefault();
        alert('Please fix all validation errors before submitting.');
      }
    });
  }
});