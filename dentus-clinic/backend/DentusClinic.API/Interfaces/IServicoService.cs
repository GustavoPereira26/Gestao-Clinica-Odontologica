using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Interfaces;

public interface IServicoService
{
    Task<IEnumerable<ServicoResponse>> ListarTodosAsync();
    Task<ServicoResponse?> BuscarPorIdAsync(int id);
    Task<ServicoResponse> CadastrarAsync(ServicoRequest request);
    Task<ServicoResponse?> EditarAsync(int id, ServicoRequest request);
    Task<bool> RemoverAsync(int id);
}
