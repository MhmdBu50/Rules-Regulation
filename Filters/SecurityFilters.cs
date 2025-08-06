using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace RulesRegulation.Filters
{
    /// <summary>
    /// Security filter that prevents page caching and adds security headers
    /// This helps prevent users from accessing cached pages after logout
    /// Updated to allow better back button functionality while maintaining security
    /// </summary>
    public class NoCache : ActionFilterAttribute
    {
        public override void OnResultExecuting(ResultExecutingContext context)
        {
            // Set cache control headers to prevent browser caching sensitive content
            // But allow normal browser navigation
            context.HttpContext.Response.Headers["Cache-Control"] = "no-store, must-revalidate";
            context.HttpContext.Response.Headers["Pragma"] = "no-cache";
            context.HttpContext.Response.Headers["Expires"] = "0";
            
            // Additional security headers
            context.HttpContext.Response.Headers["X-Frame-Options"] = "DENY";
            context.HttpContext.Response.Headers["X-Content-Type-Options"] = "nosniff";
            
            base.OnResultExecuting(context);
        }
    }

    /// <summary>
    /// Security filter that checks authentication status and prevents cached access
    /// </summary>
    public class SecurePageAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            // Check if user is authenticated
            var userId = context.HttpContext.Session.GetInt32("UserId");
            
            if (userId == null || userId == 0)
            {
                // User is not logged in, redirect to login page
                context.Result = new RedirectToActionResult("LoginPage", "Account", null);
                return;
            }

            // Set cache control headers for authenticated pages
            // Allow browser navigation but prevent sensitive data caching
            context.HttpContext.Response.Headers["Cache-Control"] = "no-store, must-revalidate, private";
            context.HttpContext.Response.Headers["Pragma"] = "no-cache";
            context.HttpContext.Response.Headers["Expires"] = "0";
            
            base.OnActionExecuting(context);
        }
    }
}
