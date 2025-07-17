using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RulesRegulation.Models;

namespace RulesRegulation.Controllers;

public class AdminController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public AdminController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }
    public IActionResult AdminPage()
    {
        return View();
    }

    public IActionResult AddNewRecord()
    {
        return View();
    }

    public IActionResult AddNewContactInfo()
    {
        return View();
    }

}
