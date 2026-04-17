using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class ProntuarioRepository : IProntuarioRepository
{
    private readonly AppDbContext _context;

    public ProntuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Prontuario>> ListarTodosAsync()
        => await _context.Prontuarios.Include(p => p.Paciente).ToListAsync();

    public async Task<Prontuario?> BuscarPorIdAsync(int id)
        => await _context.Prontuarios.Include(p => p.Paciente).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Prontuario?> BuscarPorPacienteAsync(int idPaciente)
        => await _context.Prontuarios.Include(p => p.Paciente).FirstOrDefaultAsync(p => p.IdPaciente == idPaciente);

    public async Task AdicionarAsync(Prontuario prontuario)
    {
        _context.Prontuarios.Add(prontuario);
        await _context.SaveChangesAsync();
    }
}
