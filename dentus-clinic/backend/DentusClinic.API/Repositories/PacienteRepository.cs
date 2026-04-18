using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class PacienteRepository : IPacienteRepository
{
    private readonly AppDbContext _contexto;

    public PacienteRepository(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IEnumerable<Paciente>> ListarTodosAsync()
        => await _contexto.Pacientes.ToListAsync();

    public async Task<Paciente?> BuscarPorIdAsync(int id)
        => await _contexto.Pacientes.FindAsync(id);

    public async Task<bool> ExisteCpfAsync(string cpf, int? idExcluido = null)
        => await _contexto.Pacientes.AnyAsync(p => p.Cpf == cpf && (idExcluido == null || p.Id != idExcluido));

    public async Task<bool> ExisteEmailAsync(string email, int? idExcluido = null)
        => await _contexto.Pacientes.AnyAsync(p => p.Email == email && (idExcluido == null || p.Id != idExcluido));

    public async Task AdicionarAsync(Paciente paciente)
    {
        _contexto.Pacientes.Add(paciente);
        await _contexto.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Paciente paciente)
        => await _contexto.SaveChangesAsync();

    public async Task RemoverAsync(Paciente paciente)
    {
        _contexto.Pacientes.Remove(paciente);
        await _contexto.SaveChangesAsync();
    }
}
