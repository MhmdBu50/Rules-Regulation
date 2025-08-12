function confirmCancel() {
  if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
    document.querySelector('form').reset();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Arabic validation pattern - consistent with AdminTable validation
  const arabicPattern = /^[\u0600-\u06FF\s\u060C\u061B\u061F\u0640]*$/;

  // English validation pattern - consistent with AdminTable validation
  const englishPattern = /^[a-zA-Z0-9\s\-.,'()&]+$/;
  
  
  // Arabic validation function
  function validateArabicField(input, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    
    if (input.value.trim() && !arabicPattern.test(input.value)) {
      if (errorElement) {
        errorElement.textContent = "This field must contain only Arabic text.";
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

  // English validation function
  function validateEnglishField(input, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    
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

  // Get form elements - using actual IDs from the view
  const nameInput = document.getElementById('Name');
  const nameArInput = document.getElementById('NameAr');
  const mobileInput = document.getElementById('Mobile');
  const telephoneInput = document.getElementById('Telephone');

  // Real-time validation for English name field
  if (nameInput) {
    nameInput.addEventListener('input', function () {
      validateEnglishField(this, 'nameError');
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
      console.log('Form submission validation started');
      let isValid = true;
      
      // Validate English name field if it has content
      if (nameInput && nameInput.value.trim()) {
        console.log('Validating English name:', nameInput.value);
        if (!validateEnglishField(nameInput, 'nameError')) {
          console.log('English name validation failed');
          isValid = false;
        }
      }
      
      // Validate Arabic name field if it has content
      if (nameArInput && nameArInput.value.trim()) {
        console.log('Validating Arabic name:', nameArInput.value);
        if (!validateArabicField(nameArInput, 'nameArError')) {
          console.log('Arabic name validation failed');
          isValid = false;
        }
      }
      
      console.log('Form validation result:', isValid);
      if (!isValid) {
        e.preventDefault();
        alert('Please ensure all fields contain only the appropriate script before submitting.');
      }
    });
  }
});
