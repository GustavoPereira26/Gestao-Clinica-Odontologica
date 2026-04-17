using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class ConsultaRepository : IConsultaRepository
{
    private readonly AppDbContext _context;

    public ConsultaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Consulta>> ListarTodosAsync()
        => await _context.Consultas.Include(c => c.Dentista).Include(c => c.Paciente).ToListAsync();

    public async Task<Consulta?> BuscarPorIdAsync(int id)
        => await _context.Consultas.Include(c => c.Dentista).Include(c => c.Paciente).FirstOrDefaultAsync(c => c.Id == id);

    public async Task<bool> ExisteConflitoAsync(int idDentista, DateOnly data, TimeOnly hora, int? excludeId = null)
        => await _context.Consultas.AnyAsync(c =>
            c.IdDentista == idDentista &&
            c.DataConsulta == data &&
            c.HoraConsulta == hora &&
            c.Status != "Cancelada" &&
            (excludeId == null || c.Id != excludeId));

    public async Task AdicionarAsync(Consulta consulta)
    {
        _context.Consultas.Add(consulta);
        await _context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Consulta consulta)
        => await _context.SaveChangesAsync();
}
