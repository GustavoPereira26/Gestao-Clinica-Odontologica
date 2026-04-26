using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class FuncionarioRepository : IFuncionarioRepository
{
    private readonly AppDbContext _contexto;

    public FuncionarioRepository(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IEnumerable<Funcionario>> ListarTodosAsync()
        => await _contexto.Funcionarios.Include(f => f.Login).ToListAsync();

    public async Task<Funcionario?> BuscarPorIdAsync(int id)
        => await _contexto.Funcionarios.Include(f => f.Login).FirstOrDefaultAsync(f => f.Id == id);

    public async Task<Funcionario?> BuscarPorLoginIdAsync(int idLogin)
        => await _contexto.Funcionarios.FirstOrDefaultAsync(f => f.IdAcesso == idLogin);

    public async Task<bool> ExisteCpfAsync(string cpf, int? idExcluido = null)
        => await _contexto.Funcionarios.AnyAsync(f => f.Cpf == cpf && (idExcluido == null || f.Id != idExcluido));

    public async Task AdicionarAsync(Funcionario funcionario)
    {
        _contexto.Funcionarios.Add(funcionario);
        await _contexto.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Funcionario funcionario)
        => await _contexto.SaveChangesAsync();

    public async Task RemoverAsync(Funcionario funcionario)
    {
        _contexto.Funcionarios.Remove(funcionario);
        await _contexto.SaveChangesAsync();
    }
}
