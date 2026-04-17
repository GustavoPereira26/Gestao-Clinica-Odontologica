using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class PacienteRepository : IPacienteRepository
{
    private readonly AppDbContext _context;

    public PacienteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Paciente>> ListarTodosAsync()
        => await _context.Pacientes.ToListAsync();

    public async Task<Paciente?> BuscarPorIdAsync(int id)
        => await _context.Pacientes.FindAsync(id);

    public async Task<bool> ExisteCpfAsync(string cpf, int? excludeId = null)
        => await _context.Pacientes.AnyAsync(p => p.Cpf == cpf && (excludeId == null || p.Id != excludeId));

    public async Task AdicionarAsync(Paciente paciente)
    {
        _context.Pacientes.Add(paciente);
        await _context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Paciente paciente)
        => await _context.SaveChangesAsync();

    public async Task RemoverAsync(Paciente paciente)
    {
        _context.Pacientes.Remove(paciente);
        await _context.SaveChangesAsync();
    }
}
