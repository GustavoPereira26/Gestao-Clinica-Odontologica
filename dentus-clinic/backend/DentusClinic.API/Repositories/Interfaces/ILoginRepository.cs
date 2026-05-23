using DentusClinic.API.Models;

namespace DentusClinic.API.Repositories.Interfaces;

public interface ILoginRepository
{
    Task<Login?> BuscarPorEmailAsync(string email);
    Task<bool> ExisteEmailAsync(string email);
    Task AdicionarAsync(Login login);
    Task RemoverAsync(Login login);
}
