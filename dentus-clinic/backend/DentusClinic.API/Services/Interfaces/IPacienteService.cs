using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Interfaces;

public interface IPacienteService
{
    Task<IEnumerable<PacienteResponse>> ListarTodosAsync();
    Task<PacienteResponse?> BuscarPorIdAsync(int id);
    Task<PacienteResponse> CadastrarAsync(PacienteRequest request);
    Task<PacienteResponse?> EditarAsync(int id, PacienteEditarRequest request);
    Task<bool> RemoverAsync(int id);
}
