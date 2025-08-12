function confirmCancel() {
  if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
    document.querySelector('form').reset();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Arabic validation pattern - includes Arabic letters, punctuation, and common symbols
  const arabicPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9\s\.\,\:\;\!\?\@\#\$\%\^\&\*\(\)\[\]\{\}\/\\\<\>\-\_\+\=\"\'\|،؟؛\n\r]+$/;

  // English validation pattern
  
  
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

  // English validation function
  function validateEnglishField(input, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    const englishPattern = /^[a-zA-Z0-9\s\-.,'()&]+$/;
    
    if (input.value.trim() && !englishPattern.test(input.value)) {
      errorElement.textContent = "This field must contain only English text.";
      errorElement.style.display = "block";
      return false;
    } else {
      errorElement.textContent = "";
      errorElement.style.display = "none";
      return true;
    }
  }

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
      let isValid = true;
      
      // Validate English name field if it has content
      if (nameInput && nameInput.value.trim()) {
        if (!validateEnglishField(nameInput, 'nameError')) {
          isValid = false;
        }
      }
      
      // Validate Arabic name field if it has content
      if (nameArInput && nameArInput.value.trim()) {
        if (!validateArabicField(nameArInput, 'nameArError')) {
          isValid = false;
        }
      }
      
      if (!isValid) {
        e.preventDefault();
        alert('Please ensure all fields contain only the appropriate script before submitting.');
      }
    });
  }
});
