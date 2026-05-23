using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Interfaces;

public interface IFuncionarioService
{
    Task<IEnumerable<FuncionarioResponse>> ListarTodosAsync();
    Task<FuncionarioResponse?> BuscarPorIdAsync(int id);
    Task<FuncionarioResponse> CadastrarAsync(FuncionarioRequest request);
    Task<FuncionarioResponse?> EditarAsync(int id, FuncionarioEditarRequest request);
    Task<bool> RemoverAsync(int id);
}
