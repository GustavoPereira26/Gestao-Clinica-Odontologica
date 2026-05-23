using DentusClinic.API.Models;

namespace DentusClinic.API.Repositories.Interfaces;

public interface IDentistaRepository
{
    Task<IEnumerable<Dentista>> ListarTodosAsync();
    Task<Dentista?> BuscarPorIdAsync(int id);
    Task<Dentista?> BuscarPorLoginIdAsync(int idLogin);
    Task<bool> ExisteCpfAsync(string cpf, int? idExcluido = null);
    Task<bool> ExisteCroAsync(string cro, int? idExcluido = null);
    Task AdicionarAsync(Dentista dentista);
    Task AtualizarAsync(Dentista dentista);
    Task RemoverAsync(Dentista dentista);
}
