using DentusClinic.API.Data;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Services;

public class ProntuarioService : IProntuarioService
{
    private readonly AppDbContext _context;

    public ProntuarioService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProntuarioResponse>> ListarTodosAsync()
    {
        var lista = await _context.Prontuarios
            .Include(p => p.Paciente)
            .ToListAsync();
        return lista.Select(MapearResponse);
    }

    public async Task<ProntuarioResponse?> BuscarPorIdAsync(int id)
    {
        var prontuario = await _context.Prontuarios
            .Include(p => p.Paciente)
            .FirstOrDefaultAsync(p => p.Id == id);
        return prontuario is null ? null : MapearResponse(prontuario);
    }

    public async Task<ProntuarioResponse?> BuscarPorPacienteAsync(int idPaciente)
    {
        var prontuario = await _context.Prontuarios
            .Include(p => p.Paciente)
            .FirstOrDefaultAsync(p => p.IdPaciente == idPaciente);
        return prontuario is null ? null : MapearResponse(prontuario);
    }

    private static ProntuarioResponse MapearResponse(Models.Prontuario p) => new()
    {
        Id = p.Id,
        IdPaciente = p.IdPaciente,
        NomePaciente = p.Paciente?.Nome ?? string.Empty,
        DataAbertura = p.DataAbertura
    };
}
