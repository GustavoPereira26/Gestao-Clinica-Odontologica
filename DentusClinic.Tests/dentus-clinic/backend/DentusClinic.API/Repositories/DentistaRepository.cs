using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class DentistaRepository : IDentistaRepository
{
    private readonly AppDbContext _contexto;

    public DentistaRepository(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IEnumerable<Dentista>> ListarTodosAsync()
        => await _contexto.Dentistas.Include(d => d.Especialidade).Include(d => d.Login).ToListAsync();

    public async Task<Dentista?> BuscarPorIdAsync(int id)
        => await _contexto.Dentistas.Include(d => d.Especialidade).Include(d => d.Login).FirstOrDefaultAsync(d => d.Id == id);

    public async Task<Dentista?> BuscarPorLoginIdAsync(int idLogin)
        => await _contexto.Dentistas.FirstOrDefaultAsync(d => d.IdAcesso == idLogin);

    public async Task<bool> ExisteCpfAsync(string cpf, int? idExcluido = null)
        => await _contexto.Dentistas.AnyAsync(d => d.Cpf == cpf && (idExcluido == null || d.Id != idExcluido));

    public async Task<bool> ExisteCroAsync(string cro, int? idExcluido = null)
        => await _contexto.Dentistas.AnyAsync(d => d.Cro == cro && (idExcluido == null || d.Id != idExcluido));

    public async Task AdicionarAsync(Dentista dentista)
    {
        _contexto.Dentistas.Add(dentista);
        await _contexto.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Dentista dentista)
        => await _contexto.SaveChangesAsync();

    public async Task RemoverAsync(Dentista dentista)
    {
        _contexto.Dentistas.Remove(dentista);
        await _contexto.SaveChangesAsync();
    }
}
