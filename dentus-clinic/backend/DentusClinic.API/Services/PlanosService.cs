using DentusClinic.API.Data;
using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Services;

public class PlanosService : IPlanosService
{
    private readonly AppDbContext _context;

    public PlanosService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PlanosResponse>> ListarTodosAsync()
    {
        return await _context.Planos
            .Include(p => p.Servico)
            .Select(p => MapearResponse(p))
            .ToListAsync();
    }

    public async Task<PlanosResponse?> BuscarPorIdAsync(int id)
    {
        var plano = await _context.Planos.Include(p => p.Servico).FirstOrDefaultAsync(p => p.Id == id);
        return plano is null ? null : MapearResponse(plano);
    }

    public async Task<PlanosResponse> CadastrarAsync(PlanosRequest request)
    {
        var plano = new Planos
        {
            IdProntuario = request.IdProntuario,
            IdServico = request.IdServico,
            Descricao = request.Descricao,
            Condicao = request.Condicao,
            Status = request.Status,
            Observacao = request.Observacao
        };

        _context.Planos.Add(plano);
        await _context.SaveChangesAsync();
        await _context.Entry(plano).Reference(p => p.Servico).LoadAsync();
        return MapearResponse(plano);
    }

    public async Task<PlanosResponse?> EditarAsync(int id, PlanosRequest request)
    {
        var plano = await _context.Planos.Include(p => p.Servico).FirstOrDefaultAsync(p => p.Id == id);
        if (plano is null) return null;

        plano.IdServico = request.IdServico;
        plano.Descricao = request.Descricao;
        plano.Condicao = request.Condicao;
        plano.Status = request.Status;
        plano.Observacao = request.Observacao;

        await _context.SaveChangesAsync();
        await _context.Entry(plano).Reference(p => p.Servico).LoadAsync();
        return MapearResponse(plano);
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var plano = await _context.Planos.FindAsync(id);
        if (plano is null) return false;

        _context.Planos.Remove(plano);
        await _context.SaveChangesAsync();
        return true;
    }

    private static PlanosResponse MapearResponse(Planos p) => new()
    {
        Id = p.Id,
        IdProntuario = p.IdProntuario,
        IdServico = p.IdServico,
        NomeServico = p.Servico?.Nome ?? string.Empty,
        Descricao = p.Descricao,
        Condicao = p.Condicao,
        Status = p.Status,
        Observacao = p.Observacao
    };
}
