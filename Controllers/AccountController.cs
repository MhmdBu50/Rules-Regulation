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
        var user = _dbContext.Users.FirstOrDefault(u => u.Name == Name && u.Password == password);

        if (user != null)
        {
            // ✅ Save UserId to session
            HttpContext.Session.SetInt32("UserId", user.UserId);

            // ✅ Set up claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString())
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            return RedirectToAction("HomePage", "Home");
        }

        ModelState.AddModelError("", "Invalid username or password");
        return View("~/Views/Account/LoginPage.cshtml");
    }
}

