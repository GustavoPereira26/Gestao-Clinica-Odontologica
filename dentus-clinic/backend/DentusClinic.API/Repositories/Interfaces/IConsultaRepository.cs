using DentusClinic.API.Models;

namespace DentusClinic.API.Repositories.Interfaces;

public interface IConsultaRepository
{
    Task<IEnumerable<Consulta>> ListarTodosAsync();
    Task<IEnumerable<Consulta>> ListarHojeAsync();
    Task<IEnumerable<Consulta>> ListarPorDentistaEDataAsync(int idDentista, DateOnly data);
    Task<Consulta?> BuscarPorIdAsync(int id);
    Task<bool> ExisteConflitoAsync(int idDentista, DateOnly data, TimeOnly hora, int? idExcluido = null);
    Task AdicionarAsync(Consulta consulta);
    Task AtualizarAsync(Consulta consulta);
}
