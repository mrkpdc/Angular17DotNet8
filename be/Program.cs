using be.Auth;
using be.Common;
using be.DB.Contexts;
using be.DB.Entities.AuthEntities;
using be.DB.InitialScripts;
using be.DB.Interceptors;
using be.Hubs;
using be.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using System;
using System.Threading.Tasks;
using static be.Auth.AuthPolicyManager;

namespace be
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //general configuration
            var configuration = new ConfigurationBuilder().AddJsonFile($"appsettings.json")
                .AddEnvironmentVariables().Build();

            //serilog
            Log.Logger = new LoggerConfiguration()
                 .ReadFrom.Configuration(configuration)
                 .Enrich.FromLogContext()
                 .CreateLogger();

            var builder = WebApplication.CreateBuilder(args);

            //serilog
            builder.Host.UseSerilog();

            // Add services to the container.

            builder.Services.AddControllers();

            /*
                                                User Management
            */
            //sql server
            //builder.Services.AddDbContext<AuthDBContext>(options => options.UseSqlServer(configuration.GetConnectionString("AuthDB_SQLServer"))
            //.AddInterceptors(new DBCommandInterceptor()));

            //postgres
            builder.Services.AddDbContext<AuthDBContext>(options => options.UseNpgsql(configuration.GetConnectionString("AuthDB_Postgres"))
            .AddInterceptors(new DBCommandInterceptor()));

            builder.Services.AddIdentity<User, Role>(
                options =>
                {
                    /*questo serve perché quando si criptano i nomi possono comparire dei caratteri non standard,
                     e mettendo null si ignora il controllo sui caratteri*/
                    options.User.AllowedUserNameCharacters = null;
                }
                )
                .AddEntityFrameworkStores<AuthDBContext>()
                .AddDefaultTokenProviders();
            builder.Services.AddScoped<SignInManager<User>>();
            builder.Services.AddScoped<UserManager<User>>();
            builder.Services.AddScoped<RoleManager<Role>>();

            builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie();

            builder.Services.AddAuthorization(options =>
            {
                foreach (var property in typeof(ConstantValues.Auth.Claims.Types).GetFields())
                    options.AddPolicy(property.Name, policy => policy.Requirements.Add(new AuthPolicyRequirement(property.Name)));
            });
            builder.Services.AddSingleton<IAuthorizationHandler, AuthPolicyHandler>();

            builder.Services.ConfigureApplicationCookie(options =>
            {
                /*il data protection provider serve per storare le key di criptazione in un path specifico,
                 altrimenti vengono salvate in un path di default che dipende dal sistema operativo.
                se le chiavi non sono presenti, vengono generate ogni volta diverse.
                il path di default delle keys è %LOCALAPPDATA%\ASP.NET\DataProtection-Keys,
                es: C:\Users\[utente]\AppData\Local\ASP.NET\DataProtection-Keys*/
                //options.DataProtectionProvider = DataProtectionProvider.Create(new System.IO.DirectoryInfo("C:\\keys"));
                //NOTA: il cookie viene refreshato automaticamente quando viene usato ed è ancora valido.
                options.ExpireTimeSpan = TimeSpan.FromMinutes(double.Parse(configuration.GetSection(ConstantValues.Auth.AuthSettings)
                .GetSection(ConstantValues.Auth.Cookie)
                .GetSection(ConstantValues.Auth.CookieExpiry).Value));
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.None;
                options.Cookie.HttpOnly = true;
                options.Cookie.Name = "Angular17DotNet8";
                /*questo serve per evitare il redirect automatico che fa verso "/Account/Login"*/
                options.Events.OnRedirectToLogin = context =>
                {
                    context.RedirectUri = string.Empty;
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };
            });

            /*
                                                Application entities
            */
            //sql server
            //builder.Services.AddDbContext<DBContext>(options => options.UseSqlServer(configuration.GetConnectionString("DbContext_SQLServer"))
            //.AddInterceptors(new DBCommandInterceptor()));

            //postgres
            builder.Services.AddDbContext<DBContext>(options => options.UseNpgsql(configuration.GetConnectionString("DbContext_Postgres"))
            .AddInterceptors(new DBCommandInterceptor()));

            //AESEncryptionHelper.DefaultKey = configuration.GetSection(ConstantValues.StringCypher.Cypher).GetSection(ConstantValues.StringCypher.Key).Value;
            //DBContextDump.InitialDump(services.BuildServiceProvider());

            builder.Services.AddScoped<AuthService>();
            builder.Services.AddScoped<SignalRService>();
            builder.Services.AddScoped<NotificationsService>();
            builder.Services.AddCors(o => o.AddPolicy("Cors", builder =>
            {
                builder.AllowAnyHeader()
                .AllowAnyMethod()
                .SetIsOriginAllowed(_ => true)
                .AllowCredentials();
            }));

            builder.Services.AddSignalR();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            try
            {
                //AESEncryptionHelper.DefaultKey = configuration.GetSection(ConstantValues.StringCypher.Cypher).GetSection(ConstantValues.StringCypher.Key).Value;
                DBContextDump.InitialDump(builder.Services.BuildServiceProvider());
            }
            catch (Exception ex)
            {
                Log.Logger.Error(ex, string.Empty);
            }

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
#if DEBUG
                app.UseSwagger();
                app.UseSwaggerUI();
#endif
            }
            app.UseCors("Cors");
            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseMiddleware<AuthMiddleware>();

            app.MapControllers();

            app.MapHub<SignalRHub>("api/signalRHub");

            app.Run();
        }
    }
}
