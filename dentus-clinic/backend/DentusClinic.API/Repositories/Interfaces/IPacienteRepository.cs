using DentusClinic.API.Models;

namespace DentusClinic.API.Repositories.Interfaces;

public interface IPacienteRepository
{
    Task<IEnumerable<Paciente>> ListarTodosAsync();
    Task<Paciente?> BuscarPorIdAsync(int id);
    Task<bool> ExisteCpfAsync(string cpf, int? excludeId = null);
    Task AdicionarAsync(Paciente paciente);
    Task AtualizarAsync(Paciente paciente);
    Task RemoverAsync(Paciente paciente);
}
