using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RulesRegulation.Models;
using System.Linq;

public class AccountController : Controller
{
    private readonly ILogger<AccountController> _logger;
    private readonly RRdbContext _dbContext;

    public AccountController(ILogger<AccountController> logger, RRdbContext dbContext)
    {
        _logger = logger;
        _dbContext = dbContext;
    }

    // GET: Login Page
    [HttpGet]
    public IActionResult LoginPage()
    {
        return View("~/Views/Account/LoginPage.cshtml");
    }

    // POST: Login Form Submission
    [HttpPost]
public IActionResult LoginPage(string Name, string password)
{
    var user = _dbContext.Users.FirstOrDefault(u => u.Name == Name && u.Password == password);

    if (user != null)
    {
        // ✅ SET SESSION HERE
        HttpContext.Session.SetInt32("UserId", user.UserId);

        // Redirect to homepage or dashboard
        return RedirectToAction("HomePage", "Home");
    }

    // If login failed
    ModelState.AddModelError("", "Invalid username or password");
    return View("~/Views/Account/LoginPage.cshtml");
}
}

