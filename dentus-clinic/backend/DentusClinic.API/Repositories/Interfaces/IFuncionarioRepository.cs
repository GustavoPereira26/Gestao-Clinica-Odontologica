using DentusClinic.API.Models;

namespace DentusClinic.API.Repositories.Interfaces;

public interface IFuncionarioRepository
{
    Task<IEnumerable<Funcionario>> ListarTodosAsync();
    Task<Funcionario?> BuscarPorIdAsync(int id);
    Task<Funcionario?> BuscarPorLoginIdAsync(int loginId);
    Task<bool> ExisteCpfAsync(string cpf, int? excludeId = null);
    Task AdicionarAsync(Funcionario funcionario);
    Task AtualizarAsync(Funcionario funcionario);
    Task RemoverAsync(Funcionario funcionario);
}
