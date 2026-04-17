using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class FuncionarioRepository : IFuncionarioRepository
{
    private readonly AppDbContext _context;

    public FuncionarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Funcionario>> ListarTodosAsync()
        => await _context.Funcionarios.Include(f => f.Login).ToListAsync();

    public async Task<Funcionario?> BuscarPorIdAsync(int id)
        => await _context.Funcionarios.Include(f => f.Login).FirstOrDefaultAsync(f => f.Id == id);

    public async Task<Funcionario?> BuscarPorLoginIdAsync(int loginId)
        => await _context.Funcionarios.FirstOrDefaultAsync(f => f.IdAcesso == loginId);

    public async Task<bool> ExisteCpfAsync(string cpf, int? excludeId = null)
        => await _context.Funcionarios.AnyAsync(f => f.Cpf == cpf && (excludeId == null || f.Id != excludeId));

    public async Task AdicionarAsync(Funcionario funcionario)
    {
        _context.Funcionarios.Add(funcionario);
        await _context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Funcionario funcionario)
        => await _context.SaveChangesAsync();

    public async Task RemoverAsync(Funcionario funcionario)
    {
        _context.Funcionarios.Remove(funcionario);
        await _context.SaveChangesAsync();
    }
}
