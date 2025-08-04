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

  // Get form elements - using actual IDs from the view
  const nameInput = document.getElementById('Name');
  const nameArInput = document.getElementById('NameAr');
  const mobileInput = document.getElementById('Mobile');
  const telephoneInput = document.getElementById('Telephone');

  // English name validation (letters, spaces, and common characters)
  if (nameInput) {
    nameInput.addEventListener('input', function () {
      const englishPattern = /^[a-zA-Z\s\.\-\']*$/;
      const error = document.getElementById('nameError');
      if (error) {
        if (this.value && !englishPattern.test(this.value)) {
          error.textContent = "This field must contain only English text.";
        } else {
          error.textContent = "";
        }
      }
    });
  }

  // Real-time validation for Arabic name field
  if (nameArInput) {
    nameArInput.addEventListener('input', function() {
      validateArabicField(this, 'nameArError');
    });
  }

  // Phone number validation (numbers only)
  if (mobileInput) {
    mobileInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
    });
  }

  if (telephoneInput) {
    telephoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  }

  // Form submission validation
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      let isValid = true;
      
      // Validate Arabic name field if it has content
      if (nameArInput && nameArInput.value.trim()) {
        if (!validateArabicField(nameArInput, 'nameArError')) {
          isValid = false;
        }
      }
      
      if (!isValid) {
        e.preventDefault();
        alert('Please ensure Arabic name contains only Arabic script before submitting.');
      }
    });
  }
});