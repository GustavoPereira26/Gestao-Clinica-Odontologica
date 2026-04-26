using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class ServicoRepository : IServicoRepository
{
    private readonly AppDbContext _contexto;

    public ServicoRepository(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IEnumerable<Servico>> ListarTodosAsync()
        => await _contexto.Servicos.ToListAsync();

    public async Task<Servico?> BuscarPorIdAsync(int id)
        => await _contexto.Servicos.FindAsync(id);

    public async Task AdicionarAsync(Servico servico)
    {
        _contexto.Servicos.Add(servico);
        await _contexto.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Servico servico)
        => await _contexto.SaveChangesAsync();

    public async Task RemoverAsync(Servico servico)
    {
        _contexto.Servicos.Remove(servico);
        await _contexto.SaveChangesAsync();
    }
}
