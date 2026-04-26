using DentusClinic.API.Models;

namespace DentusClinic.API.Repositories.Interfaces;

public interface IEspecialidadeRepository
{
    Task<IEnumerable<Especialidade>> ListarTodosAsync();
    Task<Especialidade?> BuscarPorIdAsync(int id);
    Task AdicionarAsync(Especialidade especialidade);
    Task AtualizarAsync(Especialidade especialidade);
    Task RemoverAsync(Especialidade especialidade);
}
