using DentusClinic.API.Models;

namespace DentusClinic.API.Repositories.Interfaces;

public interface IServicoRepository
{
    Task<IEnumerable<Servico>> ListarTodosAsync();
    Task<IEnumerable<Servico>> ListarPorEspecialidadeAsync(int idEspecialidade);
    Task<Servico?> BuscarPorIdAsync(int id);
    Task AdicionarAsync(Servico servico);
    Task AtualizarAsync(Servico servico);
    Task RemoverAsync(Servico servico);
}
