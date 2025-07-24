using RulesRegulation.Services;

var builder = WebApplication.CreateBuilder(args);

// Force Kestrel to use port 5100
builder.WebHost.UseUrls("http://localhost:5100");

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
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=homePage}/{id?}");
app.Run();
