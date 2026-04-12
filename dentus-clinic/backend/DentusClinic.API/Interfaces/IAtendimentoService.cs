using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Interfaces;

public interface IAtendimentoService
{
    Task<IEnumerable<AtendimentoResponse>> ListarTodosAsync();
    Task<AtendimentoResponse?> BuscarPorIdAsync(int id);
    Task<AtendimentoResponse> RegistrarAsync(AtendimentoRequest request);
    Task<AtendimentoResponse?> EditarAsync(int id, AtendimentoRequest request);
    Task<bool> RemoverAsync(int id);
}
