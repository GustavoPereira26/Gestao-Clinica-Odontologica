using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class AtendimentoRepository : IAtendimentoRepository
{
    private readonly AppDbContext _context;

    public AtendimentoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Atendimento>> ListarTodosAsync()
        => await _context.Atendimentos.ToListAsync();

    public async Task<Atendimento?> BuscarPorIdAsync(int id)
        => await _context.Atendimentos.FindAsync(id);

    public async Task<bool> ExistePorConsultaAsync(int idConsulta)
        => await _context.Atendimentos.AnyAsync(a => a.IdConsulta == idConsulta);

    public async Task AdicionarAsync(Atendimento atendimento)
    {
        _context.Atendimentos.Add(atendimento);
        await _context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Atendimento atendimento)
        => await _context.SaveChangesAsync();

    public async Task RemoverAsync(Atendimento atendimento)
    {
        _context.Atendimentos.Remove(atendimento);
        await _context.SaveChangesAsync();
    }
}
