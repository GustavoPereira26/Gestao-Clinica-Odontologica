using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Services.Interfaces;

public interface IProntuarioService
{
    Task<IEnumerable<ProntuarioResponse>> ListarTodosAsync();
    Task<ProntuarioResponse?> BuscarPorIdAsync(int id);
    Task<ProntuarioResponse?> BuscarPorPacienteAsync(int idPaciente);
}
