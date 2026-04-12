using DentusClinic.API.Data;
using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Services;

public class PacienteService : IPacienteService
{
    private readonly AppDbContext _context;

    public PacienteService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PacienteResponse>> ListarTodosAsync()
    {
        return await _context.Pacientes
            .Select(p => MapearResponse(p))
            .ToListAsync();
    }

    public async Task<PacienteResponse?> BuscarPorIdAsync(int id)
    {
        var paciente = await _context.Pacientes.FindAsync(id);
        return paciente is null ? null : MapearResponse(paciente);
    }

    public async Task<PacienteResponse> CadastrarAsync(PacienteRequest request)
    {
        if (await _context.Pacientes.AnyAsync(p => p.Cpf == request.Cpf))
            throw new InvalidOperationException("CPF já cadastrado no sistema.");

        var paciente = new Paciente
        {
            Nome = request.Nome,
            Cpf = request.Cpf,
            Telefone = request.Telefone,
            Email = request.Email,
            DataNascimento = request.DataNascimento,
            Endereco = request.Endereco
        };

        _context.Pacientes.Add(paciente);
        await _context.SaveChangesAsync();

        // Prontuário criado automaticamente ao cadastrar paciente
        var prontuario = new Prontuario
        {
            IdPaciente = paciente.Id,
            DataAbertura = DateOnly.FromDateTime(DateTime.Today)
        };
        _context.Prontuarios.Add(prontuario);
        await _context.SaveChangesAsync();

        return MapearResponse(paciente);
    }

    public async Task<PacienteResponse?> EditarAsync(int id, PacienteRequest request)
    {
        var paciente = await _context.Pacientes.FindAsync(id);
        if (paciente is null) return null;

        if (await _context.Pacientes.AnyAsync(p => p.Cpf == request.Cpf && p.Id != id))
            throw new InvalidOperationException("CPF já cadastrado no sistema.");

        paciente.Nome = request.Nome;
        paciente.Cpf = request.Cpf;
        paciente.Telefone = request.Telefone;
        paciente.Email = request.Email;
        paciente.DataNascimento = request.DataNascimento;
        paciente.Endereco = request.Endereco;

        await _context.SaveChangesAsync();
        return MapearResponse(paciente);
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var paciente = await _context.Pacientes.FindAsync(id);
        if (paciente is null) return false;

        _context.Pacientes.Remove(paciente);
        await _context.SaveChangesAsync();
        return true;
    }

    private static PacienteResponse MapearResponse(Paciente p) => new()
    {
        Id = p.Id,
        Nome = p.Nome,
        Cpf = p.Cpf,
        Telefone = p.Telefone,
        Email = p.Email,
        DataNascimento = p.DataNascimento,
        Endereco = p.Endereco
    };
}
