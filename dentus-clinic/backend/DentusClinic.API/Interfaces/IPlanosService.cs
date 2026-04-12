using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Interfaces;

public interface IPlanosService
{
    Task<IEnumerable<PlanosResponse>> ListarTodosAsync();
    Task<PlanosResponse?> BuscarPorIdAsync(int id);
    Task<PlanosResponse> CadastrarAsync(PlanosRequest request);
    Task<PlanosResponse?> EditarAsync(int id, PlanosRequest request);
    Task<bool> RemoverAsync(int id);
}
