using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Services.Interfaces;

public interface IFuncionarioService
{
    Task<IEnumerable<FuncionarioResponse>> ListarTodosAsync();
    Task<FuncionarioResponse?> BuscarPorIdAsync(int id);
    Task<FuncionarioResponse> CadastrarAsync(FuncionarioRequest request);
    Task<FuncionarioResponse?> EditarAsync(int id, FuncionarioRequest request);
    Task<bool> RemoverAsync(int id);
}
