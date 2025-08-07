document.addEventListener('DOMContentLoaded', function() {
    const languageToggle = document.getElementById('language-toggle');
    const languageText = document.getElementById('language-text');
    
    if (!languageToggle || !languageText) {
        return; // Exit if elements don't exist
    }
    
    // Check current language from URL or page attributes
    const currentLang = getCurrentLanguage();
    updateLanguageButton(currentLang);
    
    languageToggle.addEventListener('click', function() {
        const currentLang = getCurrentLanguage();
        const newLang = currentLang === 'en-US' ? 'ar-SA' : 'en-US';
        
        // Redirect to the same page with new language
        const currentUrl = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        
        // Update or add culture parameter
        searchParams.set('culture', newLang);
        
        // Redirect with new language
        window.location.href = `${currentUrl}?${searchParams.toString()}`;
    });
    
    function getCurrentLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const culture = urlParams.get('culture');
        
        if (culture) {
            return culture === 'ar-SA' ? 'ar-SA' : 'en-US';
        }
        
        // Check if body has RTL class or dir attribute
        if (document.body.classList.contains('rtl') || 
            document.body.getAttribute('dir') === 'rtl' ||
            document.documentElement.getAttribute('lang') === 'ar') {
            return 'ar-SA';
        }
        
        return 'en-US';
    }
    
    function updateLanguageButton(currentLang) {
        if (currentLang === 'ar-SA') {
            languageText.textContent = 'English';
            document.body.classList.add('rtl');
            document.body.setAttribute('dir', 'rtl');
        } else {
            languageText.textContent = 'العربية';
            document.body.classList.remove('rtl');
            document.body.setAttribute('dir', 'ltr');
        }
    }
});
