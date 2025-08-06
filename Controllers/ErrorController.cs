using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Diagnostics;
using RulesRegulation.Models;
using System.Diagnostics;

namespace RulesRegulation.Controllers
{
    public class ErrorController : Controller
    {
        private readonly ILogger<ErrorController> _logger;

        public ErrorController(ILogger<ErrorController> logger)
        {
            _logger = logger;
        }

        [Route("Error/{statusCode:int}")]
        public IActionResult HandleStatusCode(int statusCode)
        {
            var statusCodeResult = HttpContext.Features.Get<IStatusCodeReExecuteFeature>();

            switch (statusCode)
            {
                case 404:
                    ViewData["ErrorMessage"] = "The page or resource you requested could not be found.";
                    ViewData["OriginalPath"] = statusCodeResult?.OriginalPath;
                    return View("Error404");
                
                case 500:
                    ViewData["ErrorMessage"] = "An internal server error occurred.";
                    return View("Error500");
                
                case 400:
                    ViewData["ErrorMessage"] = "The request was invalid.";
                    return View("Error400");
                
                case 403:
                    ViewData["ErrorMessage"] = "Access to this resource is forbidden.";
                    return View("Error403");
                
                default:
                    ViewData["ErrorMessage"] = $"An error occurred (Status Code: {statusCode}).";
                    ViewData["StatusCode"] = statusCode;
                    return View("Error");
            }
        }

        [Route("Error")]
        public IActionResult Error()
        {
            var exceptionFeature = HttpContext.Features.Get<IExceptionHandlerFeature>();
            
            if (exceptionFeature != null)
            {
                var exception = exceptionFeature.Error;
                
                // Check for specific exception types
                if (exception is InvalidOperationException)
                {
                    ViewData["ErrorMessage"] = "A configuration or operation error occurred.";
                }
                else if (exception is TimeoutException)
                {
                    ViewData["ErrorMessage"] = "The operation timed out. Please try again.";
                }
                else if (exception.Message.Contains("Oracle") || exception.Message.Contains("database"))
                {
                    ViewData["ErrorMessage"] = "Database connection error. Please try again later.";
                }
                else
                {
                    ViewData["ErrorMessage"] = "An unexpected error occurred.";
                }
            }

            return View(new ErrorViewModel 
            { 
                RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier 
            });
        }

        public IActionResult Error403()
        {
            return View();
        }
    }
}
