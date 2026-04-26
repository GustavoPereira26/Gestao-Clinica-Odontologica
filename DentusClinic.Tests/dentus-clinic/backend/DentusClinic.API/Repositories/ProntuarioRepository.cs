using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class ProntuarioRepository : IProntuarioRepository
{
    private readonly AppDbContext _contexto;

    public ProntuarioRepository(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IEnumerable<Prontuario>> ListarTodosAsync()
        => await _contexto.Prontuarios.Include(p => p.Paciente).ToListAsync();

    public async Task<Prontuario?> BuscarPorIdAsync(int id)
        => await _contexto.Prontuarios.Include(p => p.Paciente).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Prontuario?> BuscarPorPacienteAsync(int idPaciente)
        => await _contexto.Prontuarios.Include(p => p.Paciente).FirstOrDefaultAsync(p => p.IdPaciente == idPaciente);

    public async Task AdicionarAsync(Prontuario prontuario)
    {
        _contexto.Prontuarios.Add(prontuario);
        await _contexto.SaveChangesAsync();
    }
}
