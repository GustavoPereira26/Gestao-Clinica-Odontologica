using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Services.Interfaces;
using DentusClinic.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace DentusClinic.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var resultado = await _authService.LoginAsync(request);
        if (resultado is null)
            return Unauthorized(ApiResponse<object>.Erro("E-mail ou senha inválidos."));

        return Ok(ApiResponse<object>.Ok(resultado, "Login realizado com sucesso."));
    }
}
