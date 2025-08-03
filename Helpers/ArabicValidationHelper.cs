using System.Text.RegularExpressions;

namespace RulesRegulation.Helpers
{
    public static class ArabicValidationHelper
    {
        // Arabic script regex pattern - includes Arabic letters, punctuation, and common symbols
        private static readonly Regex ArabicPattern = new Regex(@"^[\u0600-\u06FF\s\u060C\u061B\u061F\u0640]*$", RegexOptions.Compiled);
        
        /// <summary>
        /// Validates if the given text contains only Arabic script
        /// </summary>
        /// <param name="text">Text to validate</param>
        /// <returns>True if text is empty/null or contains only Arabic script</returns>
        public static bool IsValidArabicText(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return true; // Empty or null is considered valid (optional field)
            
            return ArabicPattern.IsMatch(text);
        }
        
        /// <summary>
        /// Validates if the given text contains only Arabic script and returns error message if invalid
        /// </summary>
        /// <param name="text">Text to validate</param>
        /// <param name="fieldName">Name of the field being validated</param>
        /// <returns>Error message if invalid, null if valid</returns>
        public static string? ValidateArabicField(string? text, string fieldName)
        {
            if (string.IsNullOrWhiteSpace(text))
                return null; // Empty or null is valid for optional fields
            
            if (!ArabicPattern.IsMatch(text))
                return $"{fieldName} must contain only Arabic script.";
            
            return null;
        }
    }
}
