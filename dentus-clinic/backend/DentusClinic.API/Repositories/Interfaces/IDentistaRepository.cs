using DentusClinic.API.Models;

namespace DentusClinic.API.Repositories.Interfaces;

public interface IDentistaRepository
{
    Task<IEnumerable<Dentista>> ListarTodosAsync();
    Task<Dentista?> BuscarPorIdAsync(int id);
    Task<Dentista?> BuscarPorLoginIdAsync(int loginId);
    Task<bool> ExisteCpfAsync(string cpf, int? excludeId = null);
    Task<bool> ExisteCroAsync(string cro, int? excludeId = null);
    Task AdicionarAsync(Dentista dentista);
    Task AtualizarAsync(Dentista dentista);
    Task RemoverAsync(Dentista dentista);
}
