using DentusClinic.API.Data;
using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Services;

public class AtendimentoService : IAtendimentoService
{
    private readonly AppDbContext _context;

    public AtendimentoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AtendimentoResponse>> ListarTodosAsync()
    {
        return await _context.Atendimentos
            .Select(a => MapearResponse(a))
            .ToListAsync();
    }

    public async Task<AtendimentoResponse?> BuscarPorIdAsync(int id)
    {
        var atendimento = await _context.Atendimentos.FindAsync(id);
        return atendimento is null ? null : MapearResponse(atendimento);
    }

    public async Task<AtendimentoResponse> RegistrarAsync(AtendimentoRequest request)
    {
        // Regra: atendimento só pode ser registrado vinculado a consulta existente
        var consulta = await _context.Consultas.FindAsync(request.IdConsulta)
            ?? throw new InvalidOperationException("Consulta não encontrada.");

        if (await _context.Atendimentos.AnyAsync(a => a.IdConsulta == request.IdConsulta))
            throw new InvalidOperationException("Já existe um atendimento registrado para esta consulta.");

        var atendimento = new Atendimento
        {
            IdConsulta = request.IdConsulta,
            Descricao = request.Descricao,
            ProcedimentoRealizado = request.ProcedimentoRealizado,
            DataAtendimento = request.DataAtendimento,
            Observacao = request.Observacao
        };

        consulta.Status = "Concluida";

        _context.Atendimentos.Add(atendimento);
        await _context.SaveChangesAsync();
        return MapearResponse(atendimento);
    }

    public async Task<AtendimentoResponse?> EditarAsync(int id, AtendimentoRequest request)
    {
        var atendimento = await _context.Atendimentos.FindAsync(id);
        if (atendimento is null) return null;

        atendimento.Descricao = request.Descricao;
        atendimento.ProcedimentoRealizado = request.ProcedimentoRealizado;
        atendimento.DataAtendimento = request.DataAtendimento;
        atendimento.Observacao = request.Observacao;

        await _context.SaveChangesAsync();
        return MapearResponse(atendimento);
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var atendimento = await _context.Atendimentos.FindAsync(id);
        if (atendimento is null) return false;

        _context.Atendimentos.Remove(atendimento);
        await _context.SaveChangesAsync();
        return true;
    }

    private static AtendimentoResponse MapearResponse(Atendimento a) => new()
    {
        Id = a.Id,
        IdConsulta = a.IdConsulta,
        Descricao = a.Descricao,
        ProcedimentoRealizado = a.ProcedimentoRealizado,
        DataAtendimento = a.DataAtendimento,
        Observacao = a.Observacao
    };
}
