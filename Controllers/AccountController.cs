using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RulesRegulation.Models;
using System.Linq;
using System.Security.Claims;

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
public async Task<IActionResult> LoginPage(string Name, string password)
{
    try
    {
        // 🔒 Validate input
        if (string.IsNullOrWhiteSpace(Name) || string.IsNullOrWhiteSpace(password))
        {
            ModelState.AddModelError("", "Username and password are required.");
            return View("~/Views/Account/LoginPage.cshtml");
        }

        // 🔍 Clean values for consistency
        string normalizedName = Name.Trim();
        string normalizedPassword = password.Trim();

        // 🔎 Query the database (case-sensitive by default in Oracle)
        var user = _dbContext.Users
            .FirstOrDefault(u => u.Name.ToLower() == normalizedName.ToLower()
                              && u.Password == normalizedPassword);

        // ❌ If user not found
        if (user == null)
        {
            ModelState.AddModelError("", "Invalid username or password.");
            return View("~/Views/Account/LoginPage.cshtml");
        }

        // ✅ Save UserId to session
        HttpContext.Session.SetInt32("UserId", user.UserId);

        // ✅ Set up claims for authentication
        var claims = new List<System.Security.Claims.Claim>
        {
            new(System.Security.Claims.ClaimTypes.Name, user.Name),
            new(System.Security.Claims.ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(System.Security.Claims.ClaimTypes.Role, user.Role ?? "")
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        // ✅ Sign the user in
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        return RedirectToAction("HomePage", "Home");
    }
    catch (Oracle.ManagedDataAccess.Client.OracleException ex)
    {
        // ⚠️ Log Oracle-specific error (helpful for debugging)
        Console.WriteLine("💥 ORACLE ERROR: " + ex.Message);

        ModelState.AddModelError("", "A database error occurred. Please try again later.");
        return View("~/Views/Account/LoginPage.cshtml");
    }
}
}

