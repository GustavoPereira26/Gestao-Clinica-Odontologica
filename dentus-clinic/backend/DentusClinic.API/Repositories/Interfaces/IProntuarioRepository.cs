using DentusClinic.API.Models;

namespace DentusClinic.API.Repositories.Interfaces;

public interface IProntuarioRepository
{
    Task<IEnumerable<Prontuario>> ListarTodosAsync();
    Task<Prontuario?> BuscarPorIdAsync(int id);
    Task<Prontuario?> BuscarPorPacienteAsync(int idPaciente);
    Task AdicionarAsync(Prontuario prontuario);
}
