using DentusClinic.API.Models;

namespace DentusClinic.API.Repositories.Interfaces;

public interface IConsultaRepository
{
    Task<IEnumerable<Consulta>> ListarTodosAsync();
    Task<Consulta?> BuscarPorIdAsync(int id);
    Task<bool> ExisteConflitoAsync(int idDentista, DateOnly data, TimeOnly hora, int? excludeId = null);
    Task AdicionarAsync(Consulta consulta);
    Task AtualizarAsync(Consulta consulta);
}
