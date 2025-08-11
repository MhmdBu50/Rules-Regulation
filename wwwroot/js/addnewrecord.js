function confirmCancel() {
  if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
    document.querySelector('form').reset();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Arabic validation pattern (comprehensive Unicode with extensive punctuation)
  const arabicPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9\s\.\,\:\;\!\?\@\#\$\%\^\&\*\(\)\[\]\{\}\/\\\<\>\-\_\+\=\"\'\|،؟؛\n\r]+$/;
  
  // English validation pattern
  const englishPattern = /^[a-zA-Z0-9\s\.\,\:\;\!\?\@\#\$\%\^\&\*\(\)\[\]\{\}\/\\\<\>\-\_\+\=\"\'\|،؟؛\n\r]*$/;
  
  // Version number validation pattern (numbers, dots, hyphens, underscores)
  const versionPattern = /^[0-9.\-_]+$/;
  
  // Page number validation function
  function validatePageNumber(input) {
    const value = input.value.trim();
    const errorElement = document.getElementById('pageNumberError');
    const pageNum = parseInt(value);
    
    if (!value || pageNum < 1 || pageNum > 999 || isNaN(pageNum)) {
      input.setCustomValidity("Please enter a valid page number between 1 and 999");
      input.classList.add('is-invalid');
      if (errorElement) {
        errorElement.textContent = "Please enter a valid page number between 1 and 999";
        errorElement.style.display = 'block';
      }
      return false;
    } else {
      input.setCustomValidity("");
      input.classList.remove('is-invalid');
      if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = 'none';
      }
      return true;
    }
  }
  
  // Version number validation function
  function validateVersionNumber(input) {
    const value = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');
    
    if (value && !versionPattern.test(value)) {
      input.setCustomValidity("Please enter only numbers, dots, hyphens, and underscores (e.g., 1.0, 2.1.3, v1-0)");
      input.classList.add('is-invalid');
      if (errorElement) {
        errorElement.textContent = "Please enter only numbers, dots, hyphens, and underscores (e.g., 1.0, 2.1.3, v1-0)";
        errorElement.style.display = 'block';
      }
      return false;
    } else {
      input.setCustomValidity("");
      input.classList.remove('is-invalid');
      if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = 'none';
      }
      return true;
    }
  }
  
  // PDF attachment validation function
  function validatePdfAttachment(input) {
    const files = input.files;
    const errorElement = document.getElementById('pdfAttachmentError');
    
    if (!files || files.length === 0) {
      input.setCustomValidity("Please select a PDF file");
      input.classList.add('is-invalid');
      if (errorElement) {
        errorElement.textContent = "Please select a PDF file";
        errorElement.style.display = 'block';
      }
      return false;
    }
    
    const file = files[0];
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      input.setCustomValidity("Please select a valid PDF file");
      input.classList.add('is-invalid');
      if (errorElement) {
        errorElement.textContent = "Please select a valid PDF file";
        errorElement.style.display = 'block';
      }
      return false;
    }
    
    input.setCustomValidity("");
    input.classList.remove('is-invalid');
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.style.display = 'none';
    }
    return true;
  }
  
  // Arabic validation function
  function validateArabicField(input) {
    const value = input.value.trim();
    let errorElementId = input.id + 'Error';
    
    // Fix error element IDs for specific fields
    if (input.id === 'ApprovingEntityAr') {
      errorElementId = 'approvingEntityArError';
    } else if (input.id === 'DescriptionAr') {
      errorElementId = 'descriptionArError';
    }
    
    const errorElement = document.getElementById(errorElementId);
    
    if (value && !arabicPattern.test(value)) {
      input.setCustomValidity("Please enter Arabic text, numbers, spaces, and common punctuation");
      input.classList.add('is-invalid');
      if (errorElement) {
        errorElement.textContent = "Please enter Arabic text, numbers, spaces, and common punctuation";
        errorElement.style.display = 'block';
      }
      return false;
    } else {
      input.setCustomValidity("");
      input.classList.remove('is-invalid');
      if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = 'none';
      }
      return true;
    }
  }

  // English validation function
  function validateEnglishField(input) {
    const value = input.value.trim();
    const errorElement = document.getElementById(input.id + 'Error');
    
    // Skip validation if field is optional and empty
    if ((input.id === 'notes' || input.id === 'Description') && value === '') {
      input.setCustomValidity("");
      input.classList.remove('is-invalid');
      if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = 'none';
      }
      return true;
    }
    
    if (value && !englishPattern.test(value)) {
      input.setCustomValidity("Please enter only English letters, numbers, spaces, and common punctuation");
      input.classList.add('is-invalid');
      if (errorElement) {
        errorElement.textContent = "Please enter only English letters, numbers, spaces, and common punctuation";
        errorElement.style.display = 'block';
      }
      return false;
    } else {
      input.setCustomValidity("");
      input.classList.remove('is-invalid');
      if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = 'none';
      }
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
  const versionNumber = document.getElementById('versionNumber');
  const pageNumber = document.getElementById('pageNumber');
  const pdfAttachment = document.getElementById('pdfAttachment');

  // Real-time validation for English fields
  if (regulationName) {
    regulationName.addEventListener('input', function() {
      validateEnglishField(this);
    });
    regulationName.addEventListener('blur', function() {
      validateEnglishField(this);
    });
  }

  if (approvingEntity) {
    approvingEntity.addEventListener('input', function() {
      validateEnglishField(this);
    });
    approvingEntity.addEventListener('blur', function() {
      validateEnglishField(this);
    });
  }

  if (description) {
    description.addEventListener('input', function() {
      validateEnglishField(this);
    });
    description.addEventListener('blur', function() {
      validateEnglishField(this);
    });
  }

  if (notes) {
    notes.addEventListener('input', function() {
      validateEnglishField(this);
    });
    notes.addEventListener('blur', function() {
      validateEnglishField(this);
    });
  }

  // Version number validation
  if (versionNumber) {
    versionNumber.addEventListener('input', function() {
      validateVersionNumber(this);
    });
    versionNumber.addEventListener('blur', function() {
      validateVersionNumber(this);
    });
  }

  // Page number validation
  if (pageNumber) {
    pageNumber.addEventListener('input', function() {
      validatePageNumber(this);
    });
    pageNumber.addEventListener('blur', function() {
      validatePageNumber(this);
    });
  }

  // PDF attachment validation
  if (pdfAttachment) {
    pdfAttachment.addEventListener('change', function() {
      validatePdfAttachment(this);
    });
  }

  // Real-time validation for Arabic fields
  if (regulationNameAr) {
    regulationNameAr.addEventListener('input', function() {
      validateArabicField(this);
    });
    regulationNameAr.addEventListener('blur', function() {
      validateArabicField(this);
    });
  }

  if (approvingEntityAr) {
    approvingEntityAr.addEventListener('input', function() {
      validateArabicField(this);
    });
    approvingEntityAr.addEventListener('blur', function() {
      validateArabicField(this);
    });
  }

  if (descriptionAr) {
    descriptionAr.addEventListener('input', function() {
      validateArabicField(this);
    });
    descriptionAr.addEventListener('blur', function() {
      validateArabicField(this);
    });
  }

  if (notesAr) {
    notesAr.addEventListener('input', function() {
      validateArabicField(this);
    });
    notesAr.addEventListener('blur', function() {
      validateArabicField(this);
    });
  }

  // Form submission validation - target only the main AddNewRecord form, not the logout form
  const form = document.querySelector('form[method="post"][enctype="multipart/form-data"]');
  if (form) {
    form.addEventListener('submit', function(e) {
      let isValid = true;
      
      // Validate required English fields
      if (regulationName && !validateEnglishField(regulationName)) {
        isValid = false;
      }
      
      if (approvingEntity && !validateEnglishField(approvingEntity)) {
        isValid = false;
      }
      
      // Validate optional English fields if they have content
      if (description && description.value.trim() && !validateEnglishField(description)) {
        isValid = false;
      }
      
      if (notes && notes.value.trim() && !validateEnglishField(notes)) {
        isValid = false;
      }
      
      // Validate version number field
      if (versionNumber && !validateVersionNumber(versionNumber)) {
        isValid = false;
      }
      
      // Validate page number field
      if (pageNumber && !validatePageNumber(pageNumber)) {
        isValid = false;
      }
      
      // Validate PDF attachment (mandatory)
      if (pdfAttachment && !validatePdfAttachment(pdfAttachment)) {
        isValid = false;
      }
      
      // Validate required Arabic fields
      if (regulationNameAr && !validateArabicField(regulationNameAr)) {
        isValid = false;
      }
      
      if (approvingEntityAr && !validateArabicField(approvingEntityAr)) {
        isValid = false;
      }
      
      // Validate optional Arabic fields if they have content
      if (descriptionAr && descriptionAr.value.trim() && !validateArabicField(descriptionAr)) {
        isValid = false;
      }
      
      if (notesAr && notesAr.value.trim() && !validateArabicField(notesAr)) {
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