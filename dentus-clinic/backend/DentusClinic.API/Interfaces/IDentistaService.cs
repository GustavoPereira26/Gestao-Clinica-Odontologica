using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Interfaces;

public interface IDentistaService
{
    Task<IEnumerable<DentistaResponse>> ListarTodosAsync();
    Task<DentistaResponse?> BuscarPorIdAsync(int id);
    Task<DentistaResponse> CadastrarAsync(DentistaRequest request);
    Task<DentistaResponse?> EditarAsync(int id, DentistaRequest request);
    Task<bool> RemoverAsync(int id);
}
