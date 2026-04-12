using DentusClinic.API.Data;
using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Services;

public class ServicoService : IServicoService
{
    private readonly AppDbContext _context;

    public ServicoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ServicoResponse>> ListarTodosAsync()
    {
        return await _context.Servicos
            .Select(s => new ServicoResponse { Id = s.Id, Nome = s.Nome })
            .ToListAsync();
    }

    public async Task<ServicoResponse?> BuscarPorIdAsync(int id)
    {
        var servico = await _context.Servicos.FindAsync(id);
        return servico is null ? null : new ServicoResponse { Id = servico.Id, Nome = servico.Nome };
    }

    public async Task<ServicoResponse> CadastrarAsync(ServicoRequest request)
    {
        var servico = new Servico { Nome = request.Nome };
        _context.Servicos.Add(servico);
        await _context.SaveChangesAsync();
        return new ServicoResponse { Id = servico.Id, Nome = servico.Nome };
    }

    public async Task<ServicoResponse?> EditarAsync(int id, ServicoRequest request)
    {
        var servico = await _context.Servicos.FindAsync(id);
        if (servico is null) return null;

        servico.Nome = request.Nome;
        await _context.SaveChangesAsync();
        return new ServicoResponse { Id = servico.Id, Nome = servico.Nome };
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var servico = await _context.Servicos.FindAsync(id);
        if (servico is null) return false;

        _context.Servicos.Remove(servico);
        await _context.SaveChangesAsync();
        return true;
    }
}
