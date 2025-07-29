// 1️⃣ Global: Show All Records
function showAllRecords() {
    const allCards = document.querySelectorAll(".medium-card");
    allCards.forEach(card => {
        card.style.display = "block";
    });

    showToast("📚 Showing all records");
}

// 2️⃣ Global: Filter Saved Records
function filterSavedRecords() {
    fetch('/Saved/ListIds', {
        method: 'GET',
        credentials: 'include'
    })
    .then(res => res.json())
    .then(savedIds => {
        const allCards = document.querySelectorAll(".medium-card");

        allCards.forEach(card => {
            const bookmark = card.querySelector(".bookmark");
            const recordId = parseInt(bookmark.getAttribute("data-record-id"));

            if (savedIds.includes(recordId)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });

        showToast("🔖 Showing only saved records");
    })
    .catch(() => {
        alert("⚠️ Could not load saved records.");
    });
}

// 3️⃣ Global: Toggle Bookmark
function toggleBookmark(elem) {
    const recordId = parseInt(elem.getAttribute("data-record-id"));

    fetch('/Saved/Toggle', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recordId })
    })
    .then(async res => {
        const text = await res.text();

        if (!text) {
            console.warn("Empty response");
            return;
        }

        let result;
        try {
            result = JSON.parse(text);
        } catch (err) {
            console.error("JSON parse failed:", err);
            return;
        }

        if (result.removed) {
            elem.style.background = 'rgba(255, 255, 255, 0.9)';
            showToast('Bookmark removed ❌');
        } else {
            elem.style.background = '#ffc107';
            showToast('Bookmarked ✅');
        }
    })
    .catch(() => {
        alert("⚠️ Failed to toggle bookmark.");
    });
}

// 4️⃣ DOM READY: Highlight saved bookmarks
document.addEventListener("DOMContentLoaded", function () {
    fetch('/Saved/ListIds', {
        method: 'GET',
        credentials: 'include'
    })
    .then(res => res.json())
    .then(savedIds => {
        document.querySelectorAll(".bookmark").forEach(elem => {
            const recordId = parseInt(elem.getAttribute("data-record-id"));
            if (savedIds.includes(recordId)) {
                elem.style.background = '#ffc107';
                elem.classList.add('bookmarked');
            } else {
                elem.style.background = 'rgba(255, 255, 255, 0.9)';
                elem.classList.remove('bookmarked');
            }
        });
    })
    .catch(() => {
        console.error("⚠️ Failed to load saved bookmarks.");
    });

    // ✅ Attach showAllRecords to all nav buttons
    document.querySelectorAll(".bar-button").forEach(btn => {
        btn.addEventListener("click", showAllRecords);
    });
});