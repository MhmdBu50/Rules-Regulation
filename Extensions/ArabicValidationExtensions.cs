using RulesRegulation.Services;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace RulesRegulation.Extensions
{
    /// <summary>
    /// HTML Helper extensions for Arabic validation
    /// Provides easy access to Arabic validation features from Razor views
    /// </summary>
    public static class ArabicValidationExtensions
    {
        /// <summary>
        /// Generates Arabic validation script for specified fields
        /// Usage in Razor view: @Html.ArabicValidationScript("field1", "field2")
        /// </summary>
        public static IHtmlContent ArabicValidationScript(this IHtmlHelper htmlHelper, params string[] fieldIds)
        {
            var script = OracleDbService.GenerateArabicValidationScript(fieldIds);
            return new HtmlString(script);
        }

        /// <summary>
        /// Generates error display elements for Arabic fields
        /// Usage in Razor view: @Html.ArabicErrorElements("field1", "field2")
        /// </summary>
        public static IHtmlContent ArabicErrorElements(this IHtmlHelper htmlHelper, params string[] fieldIds)
        {
            var elements = OracleDbService.GenerateArabicErrorElements(fieldIds);
            return new HtmlString(elements);
        }

        /// <summary>
        /// Complete validation package for AddNewRecord form
        /// Usage in Razor view: @Html.AddNewRecordValidation()
        /// </summary>
        public static IHtmlContent AddNewRecordValidation(this IHtmlHelper htmlHelper)
        {
            var package = OracleDbService.GetAddNewRecordValidationPackage();
            return new HtmlString(package);
        }

        /// <summary>
        /// Complete validation package for AddNewContactInfo form
        /// Usage in Razor view: @Html.AddNewContactInfoValidation()
        /// </summary>
        public static IHtmlContent AddNewContactInfoValidation(this IHtmlHelper htmlHelper)
        {
            var package = OracleDbService.GetAddNewContactInfoValidationPackage();
            return new HtmlString(package);
        }

        /// <summary>
        /// Quick Arabic validation for a single field
        /// Usage in controller: bool isValid = Html.ValidateArabicText(userInput);
        /// </summary>
        public static bool ValidateArabicText(this IHtmlHelper htmlHelper, string? text)
        {
            return OracleDbService.IsValidArabicText(text);
        }
    }
}
