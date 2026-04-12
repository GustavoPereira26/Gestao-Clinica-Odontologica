using DentusClinic.API.Data;
using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Services;

public class ConsultaService : IConsultaService
{
    private readonly AppDbContext _context;

    public ConsultaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ConsultaResponse>> ListarTodosAsync()
    {
        return await _context.Consultas
            .Include(c => c.Dentista)
            .Include(c => c.Paciente)
            .Select(c => MapearResponse(c))
            .ToListAsync();
    }

    public async Task<ConsultaResponse?> BuscarPorIdAsync(int id)
    {
        var consulta = await _context.Consultas
            .Include(c => c.Dentista)
            .Include(c => c.Paciente)
            .FirstOrDefaultAsync(c => c.Id == id);
        return consulta is null ? null : MapearResponse(consulta);
    }

    public async Task<ConsultaResponse> AgendarAsync(ConsultaRequest request)
    {
        // Regra: paciente deve estar cadastrado
        var paciente = await _context.Pacientes.FindAsync(request.IdPaciente)
            ?? throw new InvalidOperationException("Paciente não encontrado.");

        // Regra: dentista não pode ter duas consultas no mesmo horário na mesma data
        var conflito = await _context.Consultas.AnyAsync(c =>
            c.IdDentista == request.IdDentista &&
            c.DataConsulta == request.DataConsulta &&
            c.HoraConsulta == request.HoraConsulta &&
            c.Status != "Cancelada");

        if (conflito)
            throw new InvalidOperationException("Dentista já possui consulta agendada nesse horário.");

        var consulta = new Consulta
        {
            DataConsulta = request.DataConsulta,
            HoraConsulta = request.HoraConsulta,
            Retorno = request.Retorno,
            Status = "Agendada",
            IdDentista = request.IdDentista,
            IdPaciente = request.IdPaciente
        };

        _context.Consultas.Add(consulta);
        await _context.SaveChangesAsync();
        await _context.Entry(consulta).Reference(c => c.Dentista).LoadAsync();
        consulta.Paciente = paciente;

        return MapearResponse(consulta);
    }

    public async Task<ConsultaResponse?> EditarAsync(int id, ConsultaRequest request)
    {
        var consulta = await _context.Consultas
            .Include(c => c.Dentista)
            .Include(c => c.Paciente)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (consulta is null) return null;

        var conflito = await _context.Consultas.AnyAsync(c =>
            c.IdDentista == request.IdDentista &&
            c.DataConsulta == request.DataConsulta &&
            c.HoraConsulta == request.HoraConsulta &&
            c.Status != "Cancelada" &&
            c.Id != id);

        if (conflito)
            throw new InvalidOperationException("Dentista já possui consulta agendada nesse horário.");

        consulta.DataConsulta = request.DataConsulta;
        consulta.HoraConsulta = request.HoraConsulta;
        consulta.Retorno = request.Retorno;
        consulta.IdDentista = request.IdDentista;
        consulta.IdPaciente = request.IdPaciente;

        await _context.SaveChangesAsync();
        await _context.Entry(consulta).Reference(c => c.Dentista).LoadAsync();
        await _context.Entry(consulta).Reference(c => c.Paciente).LoadAsync();

        return MapearResponse(consulta);
    }

    public async Task<bool> RegistrarChegadaAsync(int id)
    {
        var consulta = await _context.Consultas.FindAsync(id);
        if (consulta is null) return false;

        consulta.Status = "Aguardando";
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelarAsync(int id)
    {
        var consulta = await _context.Consultas.FindAsync(id);
        if (consulta is null) return false;

        consulta.Status = "Cancelada";
        await _context.SaveChangesAsync();
        return true;
    }

    private static ConsultaResponse MapearResponse(Consulta c) => new()
    {
        Id = c.Id,
        DataConsulta = c.DataConsulta,
        HoraConsulta = c.HoraConsulta,
        Retorno = c.Retorno,
        Status = c.Status,
        IdDentista = c.IdDentista,
        NomeDentista = c.Dentista?.Nome ?? string.Empty,
        IdPaciente = c.IdPaciente,
        NomePaciente = c.Paciente?.Nome ?? string.Empty
    };
}
