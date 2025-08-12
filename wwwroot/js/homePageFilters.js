// ==================== Navigation Bar Button Handlers ====================

// Home button: resets all filters
function navigateToHome(btn) {
  alter(btn);
  showMainRecords(); // Exit history view
  window.showOnlySaved = false; // Clear saved filter
  window.savedRecordIds = null; // Clear saved IDs
  clearFilters(); // Clears all filters and shows all cards
}

// Student Guides button: sets filters and applies
function navigateToStudentGuides(btn) {
  alter(btn);
  showMainRecords(); // Exit history view
  window.showOnlySaved = false; // Clear saved filter
  window.savedRecordIds = null; // Clear saved IDs

  // Clear all type filters first
  document.getElementById("regulationsFilter").checked = false;
  document.getElementById("guidelinesFilter").checked = false;
  document.getElementById("policiesFilter").checked = false;
  document.getElementById("academicFilter").checked = false;

  // Set Student guides & templates
  document.getElementById("regulationsFilter").checked = true;
  applyFilters();
}

// Student Rules button: students + regulations + policies
function navigateToStudentRules(btn) {
  alter(btn);
  showMainRecords(); // Exit history view
  window.showOnlySaved = false; // Clear saved filter
  window.savedRecordIds = null; // Clear saved IDs

  // Clear all type filters first
  document.getElementById("regulationsFilter").checked = false;
  document.getElementById("guidelinesFilter").checked = false;
  document.getElementById("policiesFilter").checked = false;
  document.getElementById("academicFilter").checked = false;

  // Set Student rules & regulations
  document.getElementById("guidelinesFilter").checked = true;
  applyFilters();
}


// Employee Rules button: members + all types
function navigateToEmployeeRules(btn) {
  alter(btn);
  showMainRecords(); // Exit history view
  window.showOnlySaved = false; // Clear saved filter
  window.savedRecordIds = null; // Clear saved IDs

  // Clear all type filters first
  document.getElementById("regulationsFilter").checked = false;
  document.getElementById("guidelinesFilter").checked = false;
  document.getElementById("policiesFilter").checked = false;
  document.getElementById("academicFilter").checked = false;

  // Set Employees' rules & regulations
  document.getElementById("policiesFilter").checked = true;
  applyFilters();
}

// Academic Rules button: enrolled + all types
function navigateToAcademicRules(btn) {
  alter(btn);
  showMainRecords(); // Exit history view
  window.showOnlySaved = false; // Clear saved filter
  window.savedRecordIds = null; // Clear saved IDs

  // Clear all type filters first
  document.getElementById("regulationsFilter").checked = false;
  document.getElementById("guidelinesFilter").checked = false;
  document.getElementById("policiesFilter").checked = false;
  document.getElementById("academicFilter").checked = false;

  // Set Academic rules & regulations
  document.getElementById("academicFilter").checked = true;
  applyFilters();
}

// Saved button: only bookmarked records
function navigateToSaved(btn) {
  alter(btn); // Visual feedback like other nav buttons
  showMainRecords(); // Exit history view
  clearFilters(); // Clear all filters visually
  filterSavedRecords(); // Then only show saved bookmarked cards
}

// ==================== Apply Filters Function ====================

function applyFilters() {
  // Grab all selected filter values

  // Normalize selected values for safe comparison
  const department = document
    .getElementById("departmentFilter")
    .value.toLowerCase();
  const sections = getChecked([
    "studentsFilter",
    "membersFilter",
    "enrolledFilter",
  ]).map((s) => s.toLowerCase());
  const types = getChecked([
    "regulationsFilter",
    "guidelinesFilter",
    "policiesFilter",
    "academicFilter",
  ]).map((t) => t.toLowerCase());
  const alpha = document.querySelector('input[name="alpha"]:checked')?.value;
  const dateSort = document.querySelector(
    'input[name="dateOption"]:checked'
  )?.value;
  const fromDate = document.getElementById("fromDate")?.value;
  const toDate = document.getElementById("toDate")?.value;
  const search =
    document.getElementById("searchInput")?.value?.toLowerCase() || "";

  // 🚨 DEBUGGING: Log all filter values

  // Reset all cards to visible before filtering
  document.querySelectorAll(".medium-card").forEach((card) => {
    card.style.display = "block";
  });

  // Loop through all document cards
  const cards = document.querySelectorAll(".document-card");

  cards.forEach((card) => {
    // Normalize all dataset values for matching
    const cardDept = card.dataset.department?.trim().toLowerCase();
    const cardSections =
      card.dataset.section?.split(",").map((s) => s.trim().toLowerCase()) || [];
    const cardType = card.dataset.type?.trim().toLowerCase();
    const cardTitle = card.dataset.title?.toLowerCase();
    const cardDate = getCardDateStr(card);


    // Check if card matches selected filters
    const matchesDept = !department || department === cardDept;
    const matchesSection =
      sections.length === 0 || sections.some((s) => cardSections.includes(s));
    const matchesType = types.length === 0 || types.includes(cardType);
    const matchesSearch = !search || cardTitle.includes(search);
    const matchesDate = isDateInRange(cardDate, fromDate, toDate);

    // Check if card matches saved records filter (if active)
    let matchesSaved = true;
    if (window.showOnlySaved && window.savedRecordIds) {
      const bookmark = card.querySelector(".bookmark");
      const recordId = parseInt(bookmark?.getAttribute("data-record-id"));
      matchesSaved = window.savedRecordIds.includes(recordId);
    }

    // 🔍 DEBUG LOGGING for matching

    const show =
      matchesDept &&
      matchesSection &&
      matchesType &&
      matchesSearch &&
      matchesDate &&
      matchesSaved;

    // Show or hide the card's container
    const wrapper = card.closest(".medium-card");
    if (wrapper) {
      wrapper.style.display = show ? "block" : "none";
    }
  });

  // Apply sorting
  if (alpha) sortCardsByTitle(alpha);
  if (dateSort && dateSort !== "range") sortCardsByDate(dateSort);
}

// ==================== Clear Filters ====================

function clearFilters() {
  // Reset all filter inputs
  document.getElementById("departmentFilter").value = "";
  [
    "studentsFilter",
    "membersFilter",
    "enrolledFilter",
    "regulationsFilter",
    "guidelinesFilter",
    "policiesFilter",
    "academicFilter",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });

  document
    .querySelectorAll('input[name="alpha"]')
    .forEach((el) => (el.checked = false));
  document
    .querySelectorAll('input[name="dateOption"]')
    .forEach((el) => (el.checked = false));
  document.getElementById("fromDate").value = "";
  document.getElementById("toDate").value = "";
  document.getElementById("searchInput").value = "";

  // Clear saved filter
  window.showOnlySaved = false;
  window.savedRecordIds = null;

  applyFilters(); // Refresh card visibility
}

// ==================== Helpers ====================

// Get all checked values from checkbox IDs
function getChecked(ids) {
  return ids
    .filter((id) => document.getElementById(id)?.checked)
    .map((id) => document.getElementById(id).value);
}

// Check if card's date is within selected range
function isDateInRange(dateStr, from, to) {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (from && d < new Date(from)) return false;
  if (to && d > new Date(to)) return false;
  return true;
}

// Sort cards by title
function sortCardsByTitle(order) {
  const container = document.querySelector(".row.justify-content-center");
  const cards = Array.from(container.querySelectorAll(".medium-card")).filter(
    (c) => c.style.display !== "none"
  );

  cards.sort((a, b) => {
    const titleA = a
      .querySelector(".document-card")
      .dataset.title.toLowerCase();
    const titleB = b
      .querySelector(".document-card")
      .dataset.title.toLowerCase();
    return order === "A-Z"
      ? titleA.localeCompare(titleB)
      : titleB.localeCompare(titleA);
  });

  cards.forEach((card) => container.appendChild(card));
}

// Sort cards by date (newest or oldest)
function sortCardsByDate(order) {
  const container = document.querySelector(".row.justify-content-center");
  const cards = Array.from(container.querySelectorAll(".medium-card")).filter(
    (c) => c.style.display !== "none"
  );

  cards.sort((a, b) => {
    // Change from dataset.date to dataset.versionDate
    const dateA = new Date(a.querySelector(".document-card").dataset.versionDate);
    const dateB = new Date(b.querySelector(".document-card").dataset.versionDate);
    return order === "newest" ? dateB - dateA : dateA - dateB;
  });

  cards.forEach((card) => container.appendChild(card));
}

// ==================== Date Range Toggle UI ====================

function setupDateRangeFieldsToggle() {
  const specifyRangeRadio = document.getElementById("specifyRange");
  const dateRangeFields = document.getElementById("dateRangeFields");
  const dateOptionRadios = document.querySelectorAll('input[name="dateOption"]');
  const fromDateInput = document.getElementById("fromDate");
  const toDateInput = document.getElementById("toDate");

  if (!specifyRangeRadio || !dateRangeFields || !dateOptionRadios.length) {
    console.error("Date range filter elements not found.");
    return;
  }

  // Toggle fields when date option changes
  dateOptionRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      const isRange = this.value === "range";
      dateRangeFields.style.setProperty("display", isRange ? "block" : "none", "important");
      applyFilters();
    });
  });

  // Apply filters when date range inputs change
  if (fromDateInput) fromDateInput.addEventListener("change", applyFilters);
  if (toDateInput) toDateInput.addEventListener("change", applyFilters);

  // Initial state on page load
  if (specifyRangeRadio.checked) {
    dateRangeFields.style.display = "block";
  } else {
    dateRangeFields.style.display = "none";
  }
}

// ---------- small helpers ----------
function debounce(fn, ms = 120) {
  let t = null;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

// Parse many common formats into a Date at local midnight. Returns null on failure.
function parseToDate(input) {
  if (!input) return null;
  input = String(input).trim();

  // YYYY-MM-DD -> interpret as local midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(input + 'T00:00:00');
  }

  // DD/MM/YYYY -> convert -> YYYY-MM-DD
  const dmy = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  }

  // fallback to Date parser (ISO, datetimes)
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

// Prefer versionDate then date attributes (handles data-version-date, data-date, etc.)
function getCardDateStr(card) {
  if (!card) return null;
  return (
    card.dataset.versionDate ||
    card.dataset.versiondate ||
    card.dataset.date ||
    card.getAttribute('data-version-date') ||
    card.getAttribute('data-date') ||
    null
  );
}

// Check if dateStr falls between from/to (both optional). If neither from/to -> true.
function isDateInRange(dateStr, fromStr, toStr) {
  if (!fromStr && !toStr) return true;

  const cardDate = parseToDate(dateStr);
  if (!cardDate) return false; // exclude cards with no valid date when range active

  cardDate.setHours(0, 0, 0, 0);
  const t = cardDate.getTime();

  if (fromStr) {
    const f = parseToDate(fromStr);
    if (!f) return false;
    f.setHours(0, 0, 0, 0);
    if (t < f.getTime()) return false;
  }
  if (toStr) {
    const tt = parseToDate(toStr);
    if (!tt) return false;
    tt.setHours(0, 0, 0, 0);
    if (t > tt.getTime()) return false;
  }
  return true;
}

// ---------- robust UI wiring for date-range controls ----------
function setupDateRangeFieldsToggle() {
  const dateRangeFields = document.getElementById('dateRangeFields');
  const radios = document.querySelectorAll('input[name="dateOption"]');
  const fromInput = document.getElementById('fromDate');
  const toInput = document.getElementById('toDate');

  // toggles the UI and re-applies filters
  function updateUiAndFilter() {
    const checked = document.querySelector('input[name="dateOption"]:checked');
    const isRange = checked && checked.value === 'range';

    if (dateRangeFields) {
      // keep grid layout from CSS; CSS shows #dateRangeFields as grid
      if (isRange) dateRangeFields.style.setProperty('display', 'grid', 'important');
      else dateRangeFields.style.setProperty('display', 'none', 'important');
    }

    // re-run filter immediately
    applyFilters();
  }

  // attach listeners to radios (defensive if HTML changes)
  radios.forEach((r) => r.addEventListener('change', updateUiAndFilter));

  // apply filters as user types dates (debounced) and also on change
  const debouncedApply = debounce(applyFilters, 120);
  if (fromInput) {
    fromInput.addEventListener('input', debouncedApply);
    fromInput.addEventListener('change', applyFilters);
  }
  if (toInput) {
    toInput.addEventListener('input', debouncedApply);
    toInput.addEventListener('change', applyFilters);
  }

  // initialize visibility based on the currently checked radio
  const initial = document.querySelector('input[name="dateOption"]:checked');
  if (dateRangeFields) {
    if (initial && initial.value === 'range') {
      dateRangeFields.style.setProperty('display', 'grid', 'important');
    } else {
      dateRangeFields.style.setProperty('display', 'none', 'important');
    }
  }
}


// ==================== Initialization on Page Load ====================

function initializeHomePageFunctionality() {
  console.log("initializeHomePageFunctionality() started!");
  setupDateRangeFieldsToggle(); // Show/hide date range fields
console.log("After setupDateRangeFieldsToggle()");
  // Remove auto-apply event listeners for manual filters
  // Only keep search input for instant search
  document
    .getElementById("searchInput")
    ?.addEventListener("input", applyFilters);

  applyFilters(); // Run filters initially (if needed)
  console.log("initializeHomePageFunctionality() finished!");
}

document.addEventListener("DOMContentLoaded", initializeHomePageFunctionality);
console.log("DOMContentLoaded fired!");