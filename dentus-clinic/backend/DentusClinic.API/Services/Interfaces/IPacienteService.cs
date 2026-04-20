using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Services.Interfaces;

public interface IPacienteService
{
    Task<IEnumerable<PacienteResponse>> ListarTodosAsync();
    Task<PacienteResponse?> BuscarPorIdAsync(int id);
    Task<PacienteResponse> CadastrarAsync(PacienteRequest request);
    Task<PacienteResponse?> EditarAsync(int id, PacienteRequest request);
    Task<bool> InativarAsync(int id);
}
