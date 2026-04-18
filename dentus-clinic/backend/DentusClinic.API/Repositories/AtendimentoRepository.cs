using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class AtendimentoRepository : IAtendimentoRepository
{
    private readonly AppDbContext _contexto;

    public AtendimentoRepository(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IEnumerable<Atendimento>> ListarTodosAsync()
        => await _contexto.Atendimentos.ToListAsync();

    public async Task<Atendimento?> BuscarPorIdAsync(int id)
        => await _contexto.Atendimentos.FindAsync(id);

    public async Task<bool> ExistePorConsultaAsync(int idConsulta)
        => await _contexto.Atendimentos.AnyAsync(a => a.IdConsulta == idConsulta);

    public async Task AdicionarAsync(Atendimento atendimento)
    {
        _contexto.Atendimentos.Add(atendimento);
        await _contexto.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Atendimento atendimento)
        => await _contexto.SaveChangesAsync();

    public async Task RemoverAsync(Atendimento atendimento)
    {
        _contexto.Atendimentos.Remove(atendimento);
        await _contexto.SaveChangesAsync();
    }
}
