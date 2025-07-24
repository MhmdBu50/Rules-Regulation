using RulesRegulation.Services;
using System.Net;
using System.Net.Sockets;
using Microsoft.AspNetCore.Localization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[]
    {
        new System.Globalization.CultureInfo("en-US"),
        new System.Globalization.CultureInfo("ar-SA"),
    };

    options.DefaultRequestCulture = new RequestCulture("en-US"); 
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
    
    options.RequestCultureProviders.Clear();
    options.RequestCultureProviders.Add(new CookieRequestCultureProvider());
    options.RequestCultureProviders.Add(new AcceptLanguageHeaderRequestCultureProvider());
});

builder.Services.AddControllersWithViews();

builder.Services.AddScoped<OracleDbService>(provider =>
{
    var config = provider.GetRequiredService<IConfiguration>();
    var connectionString = config.GetConnectionString("OracleConnection");

    if (string.IsNullOrWhiteSpace(connectionString))
        throw new InvalidOperationException("Connection string 'OracleConnection' not found.");

    return new OracleDbService(connectionString);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.MapStaticAssets();
app.UseRequestLocalization();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();

// Helper method to find an available port
static int GetAvailablePort(int preferredPort)
{
    try
    {
        using var listener = new TcpListener(IPAddress.Any, preferredPort);
        listener.Start();
        listener.Stop();
        return preferredPort;
    }
    catch (SocketException)
    {
        using var listener = new TcpListener(IPAddress.Any, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        listener.Stop();
        Console.WriteLine($"Port {preferredPort} is not available, using port {port} instead.");
        return port;
    }
}