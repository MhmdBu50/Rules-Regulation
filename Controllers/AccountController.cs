using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RulesRegulation.Models;

namespace RulesRegulation.Controllers;
public class AccountController : Controller
{

    private readonly ILogger<HomeController> _logger;

    public AccountController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult LoginPage()
    {
        return View("~/Views/Account/LoginPage.cshtml");
    }

    [HttpPost]
    public IActionResult Login(string username, string password)
    {
        // TODO: Add authentication logic here
        if (username == "admin" && password == "password") // temporary logic
        {
            return RedirectToAction("Index", "Home");
        }

        ModelState.AddModelError("", "Invalid login attempt.");
        return View();
    }
}
