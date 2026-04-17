using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class DentistaRepository : IDentistaRepository
{
    private readonly AppDbContext _context;

    public DentistaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Dentista>> ListarTodosAsync()
        => await _context.Dentistas.Include(d => d.Especialidade).Include(d => d.Login).ToListAsync();

    public async Task<Dentista?> BuscarPorIdAsync(int id)
        => await _context.Dentistas.Include(d => d.Especialidade).Include(d => d.Login).FirstOrDefaultAsync(d => d.Id == id);

    public async Task<Dentista?> BuscarPorLoginIdAsync(int loginId)
        => await _context.Dentistas.FirstOrDefaultAsync(d => d.IdAcesso == loginId);

    public async Task<bool> ExisteCpfAsync(string cpf, int? excludeId = null)
        => await _context.Dentistas.AnyAsync(d => d.Cpf == cpf && (excludeId == null || d.Id != excludeId));

    public async Task<bool> ExisteCroAsync(string cro, int? excludeId = null)
        => await _context.Dentistas.AnyAsync(d => d.Cro == cro && (excludeId == null || d.Id != excludeId));

    public async Task AdicionarAsync(Dentista dentista)
    {
        _context.Dentistas.Add(dentista);
        await _context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Dentista dentista)
        => await _context.SaveChangesAsync();

    public async Task RemoverAsync(Dentista dentista)
    {
        _context.Dentistas.Remove(dentista);
        await _context.SaveChangesAsync();
    }
}
