using RulesRegulation.Services;
using System.Net;
using System.Net.Sockets;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel with dynamic port selection
builder.WebHost.ConfigureKestrel(options =>
{
    // Try to use the configured ports first, fallback to dynamic ports
    var httpPort = GetAvailablePort(5050);
    var httpsPort = GetAvailablePort(7050);
    
    options.Listen(IPAddress.Any, httpPort);
    options.Listen(IPAddress.Any, httpsPort, listenOptions =>
    {
        listenOptions.UseHttps();
    });
    
    Console.WriteLine($"Application will run on:");
    Console.WriteLine($"HTTP:  http://localhost:{httpPort}");
    Console.WriteLine($"HTTPS: https://localhost:{httpsPort}");
});

// Add services to the container.
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
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

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
        // First, try the preferred port
        using var listener = new TcpListener(IPAddress.Any, preferredPort);
        listener.Start();
        listener.Stop();
        return preferredPort;
    }
    catch (SocketException)
    {
        // If preferred port is not available, find any available port
        using var listener = new TcpListener(IPAddress.Any, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        listener.Stop();
        Console.WriteLine($"Port {preferredPort} is not available, using port {port} instead.");
        return port;
    }
}
