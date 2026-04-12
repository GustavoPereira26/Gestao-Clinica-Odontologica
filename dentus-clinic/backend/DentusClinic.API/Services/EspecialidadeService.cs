using DentusClinic.API.Data;
using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Services;

public class EspecialidadeService : IEspecialidadeService
{
    private readonly AppDbContext _context;

    public EspecialidadeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EspecialidadeResponse>> ListarTodosAsync()
    {
        return await _context.Especialidades
            .Select(e => new EspecialidadeResponse { Id = e.Id, Nome = e.Nome })
            .ToListAsync();
    }

    public async Task<EspecialidadeResponse?> BuscarPorIdAsync(int id)
    {
        var esp = await _context.Especialidades.FindAsync(id);
        return esp is null ? null : new EspecialidadeResponse { Id = esp.Id, Nome = esp.Nome };
    }

    public async Task<EspecialidadeResponse> CadastrarAsync(EspecialidadeRequest request)
    {
        var esp = new Especialidade { Nome = request.Nome };
        _context.Especialidades.Add(esp);
        await _context.SaveChangesAsync();
        return new EspecialidadeResponse { Id = esp.Id, Nome = esp.Nome };
    }

    public async Task<EspecialidadeResponse?> EditarAsync(int id, EspecialidadeRequest request)
    {
        var esp = await _context.Especialidades.FindAsync(id);
        if (esp is null) return null;

        esp.Nome = request.Nome;
        await _context.SaveChangesAsync();
        return new EspecialidadeResponse { Id = esp.Id, Nome = esp.Nome };
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var esp = await _context.Especialidades.FindAsync(id);
        if (esp is null) return false;

        _context.Especialidades.Remove(esp);
        await _context.SaveChangesAsync();
        return true;
    }
}
