using DentusClinic.API.Models;

namespace DentusClinic.API.Repositories.Interfaces;

public interface IAtendimentoRepository
{
    Task<IEnumerable<Atendimento>> ListarTodosAsync();
    Task<Atendimento?> BuscarPorIdAsync(int id);
    Task<bool> ExistePorConsultaAsync(int idConsulta);
    Task AdicionarAsync(Atendimento atendimento);
    Task AtualizarAsync(Atendimento atendimento);
    Task RemoverAsync(Atendimento atendimento);
}
