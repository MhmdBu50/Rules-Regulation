function confirmCancel() {
  if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
    document.querySelector('form').reset();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Arabic validation pattern
  const arabicPattern = /^[\u0600-\u06FF\s\u060C\u061B\u061F\u0640]*$/;
  
  // English validation pattern
  const englishPattern = /^[a-zA-Z0-9\s\-.,'()&]+$/;
  
  // Arabic validation function
  function validateArabicField(input, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    if (!errorElement) {
      console.warn(`Error element with ID "${errorElementId}" not found`);
      return true; // If no error element, assume valid to avoid breaking functionality
    }
    
    if (input.value.trim() && !arabicPattern.test(input.value)) {
      errorElement.textContent = "This field must contain only Arabic text.";
      errorElement.style.display = "block";
      input.classList.add('is-invalid');
      return false;
    } else {
      errorElement.textContent = "";
      errorElement.style.display = "none";
      input.classList.remove('is-invalid');
      return true;
    }
  }

  // English validation function
  function validateEnglishField(input, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    if (!errorElement) {
      console.warn(`Error element with ID "${errorElementId}" not found`);
      return true; // If no error element, assume valid to avoid breaking functionality
    }
    
    const value = input.value.trim();
    
    // Skip validation if field is optional and empty
    if ((input.id === 'notes' || input.id === 'Description') && value === '') {
      errorElement.style.display = 'none';
      input.classList.remove('is-invalid');
      return true;
    }
    
    if (value && !englishPattern.test(value)) {
      errorElement.textContent = "This field must contain only English text.";
      errorElement.style.display = "block";
      input.classList.add('is-invalid');
      return false;
    } else {
      errorElement.textContent = "";
      errorElement.style.display = "none";
      input.classList.remove('is-invalid');
      return true;
    }
  }

  // Get all input fields
  const regulationName = document.getElementById('regulationName');
  const regulationNameAr = document.getElementById('regulationNameAr');
  const approvingEntity = document.getElementById('ApprovingEntity');
  const approvingEntityAr = document.getElementById('ApprovingEntityAr');
  const description = document.getElementById('Description');
  const descriptionAr = document.getElementById('DescriptionAr');
  const notes = document.getElementById('notes');
  const notesAr = document.getElementById('notesAr');

  // Real-time validation for English fields
  if (regulationName) {
    regulationName.addEventListener('input', function() {
      validateEnglishField(this, 'regulationNameError');
    });
    regulationName.addEventListener('blur', function() {
      validateEnglishField(this, 'regulationNameError');
    });
  }

  if (approvingEntity) {
    approvingEntity.addEventListener('input', function() {
      validateEnglishField(this, 'ApprovingEntityError');
    });
    approvingEntity.addEventListener('blur', function() {
      validateEnglishField(this, 'ApprovingEntityError');
    });
  }

  if (description) {
    description.addEventListener('input', function() {
      validateEnglishField(this, 'DescriptionError');
    });
    description.addEventListener('blur', function() {
      validateEnglishField(this, 'DescriptionError');
    });
  }

  if (notes) {
    notes.addEventListener('input', function() {
      validateEnglishField(this, 'notesError');
    });
    notes.addEventListener('blur', function() {
      validateEnglishField(this, 'notesError');
    });
  }

  // Real-time validation for Arabic fields
  if (regulationNameAr) {
    regulationNameAr.addEventListener('input', function() {
      validateArabicField(this, 'regulationNameArError');
    });
    regulationNameAr.addEventListener('blur', function() {
      validateArabicField(this, 'regulationNameArError');
    });
  }

  if (approvingEntityAr) {
    approvingEntityAr.addEventListener('input', function() {
      validateArabicField(this, 'approvingEntityArError');
    });
    approvingEntityAr.addEventListener('blur', function() {
      validateArabicField(this, 'approvingEntityArError');
    });
  }

  if (descriptionAr) {
    descriptionAr.addEventListener('input', function() {
      validateArabicField(this, 'descriptionArError');
    });
    descriptionAr.addEventListener('blur', function() {
      validateArabicField(this, 'descriptionArError');
    });
  }

  if (notesAr) {
    notesAr.addEventListener('input', function() {
      validateArabicField(this, 'notesArError');
    });
    notesAr.addEventListener('blur', function() {
      validateArabicField(this, 'notesArError');
    });
  }

  // Form submission validation
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      let isValid = true;
      
      // Validate required English fields
      if (regulationName && !validateEnglishField(regulationName, 'regulationNameError')) {
        isValid = false;
      }
      
      if (approvingEntity && !validateEnglishField(approvingEntity, 'ApprovingEntityError')) {
        isValid = false;
      }
      
      // Validate optional English fields if they have content
      if (description && description.value.trim() && !validateEnglishField(description, 'DescriptionError')) {
        isValid = false;
      }
      
      if (notes && notes.value.trim() && !validateEnglishField(notes, 'notesError')) {
        isValid = false;
      }
      
      // Validate required Arabic fields
      if (regulationNameAr && !validateArabicField(regulationNameAr, 'regulationNameArError')) {
        isValid = false;
      }
      
      if (approvingEntityAr && !validateArabicField(approvingEntityAr, 'approvingEntityArError')) {
        isValid = false;
      }
      
      // Validate optional Arabic fields if they have content
      if (descriptionAr && descriptionAr.value.trim() && !validateArabicField(descriptionAr, 'descriptionArError')) {
        isValid = false;
      }
      
      if (notesAr && notesAr.value.trim() && !validateArabicField(notesAr, 'notesArError')) {
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
        // Scroll to the first error
        const firstError = document.querySelector('.is-invalid');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        alert('Please fix all validation errors before submitting.');
      }
    });
  }
});