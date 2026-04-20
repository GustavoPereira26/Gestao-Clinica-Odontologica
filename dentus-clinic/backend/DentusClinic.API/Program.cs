using System.Text;
using DentusClinic.API.Attributes;
using DentusClinic.API.Data;
using DentusClinic.API.Middleware;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services;
using DentusClinic.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

//carrega as variáveis de ambiente
DotNetEnv.Env.Load();

var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");

// Repositories (injeção de dependência)
builder.Services.AddScoped<ILoginRepository, LoginRepository>();
builder.Services.AddScoped<IPacienteRepository, PacienteRepository>();
builder.Services.AddScoped<IFuncionarioRepository, FuncionarioRepository>();
builder.Services.AddScoped<IDentistaRepository, DentistaRepository>();
builder.Services.AddScoped<IEspecialidadeRepository, EspecialidadeRepository>();
builder.Services.AddScoped<IConsultaRepository, ConsultaRepository>();
builder.Services.AddScoped<IAtendimentoRepository, AtendimentoRepository>();
builder.Services.AddScoped<IProntuarioRepository, ProntuarioRepository>();
builder.Services.AddScoped<IPlanosRepository, PlanosRepository>();
builder.Services.AddScoped<IServicoRepository, ServicoRepository>();

// Services (injeção de dependência)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPacienteService, PacienteService>();
builder.Services.AddScoped<IFuncionarioService, FuncionarioService>();
builder.Services.AddScoped<IDentistaService, DentistaService>();
builder.Services.AddScoped<IEspecialidadeService, EspecialidadeService>();
builder.Services.AddScoped<IConsultaService, ConsultaService>();
builder.Services.AddScoped<IAtendimentoService, AtendimentoService>();
builder.Services.AddScoped<IProntuarioService, ProntuarioService>();
builder.Services.AddScoped<IServicoService, ServicoService>();
builder.Services.AddScoped<IPlanosService, PlanosService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5500")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Controllers com suporte a Views
builder.Services.AddControllersWithViews()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new DateOnlyConverterLeniente());
        opts.JsonSerializerOptions.Converters.Add(new TimeOnlyConverterLeniente());
    });

// Substitui o formato padrão de erros de validação pelo padrão da API
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = contextoAcao =>
    {
        var erros = contextoAcao.ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .SelectMany(x => x.Value!.Errors.Select(e => new { Campo = x.Key, e.ErrorMessage }))
            .Select(x => SanitizarMensagemValidacao(x.Campo, x.ErrorMessage))
            .Where(m => !string.IsNullOrWhiteSpace(m))
            .Distinct()
            .ToList();

        return new BadRequestObjectResult(new { error = erros });
    };

static string SanitizarMensagemValidacao(string campo, string mensagem)
{
    var ehErroInterno = mensagem.Contains("JSON") ||
                        mensagem.Contains("could not be converted") ||
                        mensagem.Contains("Path:") ||
                        mensagem.Contains("LineNumber") ||
                        mensagem.Contains("System.") ||
                        mensagem.Contains("The request");

    if (!ehErroInterno) return mensagem;

    var campoNormalizado = campo.Replace("$.", "").Replace("$", "").Trim();

    return campoNormalizado switch
    {
        "DataNascimento"  => "Data de nascimento inválida.",
        "DataConsulta"    => "Data da consulta inválida.",
        "HoraConsulta"    => "Horário da consulta inválido.",
        "DataAtendimento" => "Data do atendimento inválida.",
        "Nome"            => "Nome inválido.",
        "Cpf"             => "CPF inválido.",
        "Email"           => "E-mail inválido.",
        "Telefone"        => "Telefone inválido.",
        "request" or ""   => string.Empty,
        _                 => $"{campoNormalizado} inválido."
    };
}
});

// Swagger com suporte a Bearer Token
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Dentu's Clinic API",
        Version = "v1",
        Description = "API REST para gerenciamento da clínica odontológica Dentu's Clinic"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Informe o token JWT no formato: Bearer {token}"
    });

    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            []
        }
    });
});

var app = builder.Build();

// Seed de dados iniciais
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
    await DataSeeder.SeedAsync(context);
}

// Middleware de erros (deve ser o primeiro)
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
