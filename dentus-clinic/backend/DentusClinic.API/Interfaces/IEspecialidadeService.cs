using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Interfaces;

public interface IEspecialidadeService
{
    Task<IEnumerable<EspecialidadeResponse>> ListarTodosAsync();
    Task<EspecialidadeResponse?> BuscarPorIdAsync(int id);
    Task<EspecialidadeResponse> CadastrarAsync(EspecialidadeRequest request);
    Task<EspecialidadeResponse?> EditarAsync(int id, EspecialidadeRequest request);
    Task<bool> RemoverAsync(int id);
}
