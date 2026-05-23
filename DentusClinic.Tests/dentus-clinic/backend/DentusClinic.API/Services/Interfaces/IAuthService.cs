using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}
