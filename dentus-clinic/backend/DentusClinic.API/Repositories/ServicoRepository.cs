using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class ServicoRepository : IServicoRepository
{
    private readonly AppDbContext _context;

    public ServicoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Servico>> ListarTodosAsync()
        => await _context.Servicos.ToListAsync();

    public async Task<Servico?> BuscarPorIdAsync(int id)
        => await _context.Servicos.FindAsync(id);

    public async Task AdicionarAsync(Servico servico)
    {
        _context.Servicos.Add(servico);
        await _context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Servico servico)
        => await _context.SaveChangesAsync();

    public async Task RemoverAsync(Servico servico)
    {
        _context.Servicos.Remove(servico);
        await _context.SaveChangesAsync();
    }
}
