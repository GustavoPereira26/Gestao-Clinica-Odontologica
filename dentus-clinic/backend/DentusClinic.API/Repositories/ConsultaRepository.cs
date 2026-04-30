using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class ConsultaRepository : IConsultaRepository
{
    private readonly AppDbContext _contexto;

    public ConsultaRepository(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IEnumerable<Consulta>> ListarTodosAsync()
        => await _contexto.Consultas
            .Where(c => c.Status != "Inativa")
            .Include(c => c.Dentista).Include(c => c.Paciente).Include(c => c.Servico)
            .ToListAsync();

    public async Task<IEnumerable<Consulta>> ListarHojeAsync()
        => await _contexto.Consultas
            .Where(c => c.DataConsulta == DateOnly.FromDateTime(DateTime.Today) && c.Status != "Inativa")
            .Include(c => c.Dentista).Include(c => c.Paciente).Include(c => c.Servico)
            .OrderBy(c => c.HoraConsulta)
            .ToListAsync();

    public async Task<Consulta?> BuscarPorIdAsync(int id)
        => await _contexto.Consultas.Include(c => c.Dentista).Include(c => c.Paciente).Include(c => c.Servico).FirstOrDefaultAsync(c => c.Id == id);

    public async Task<bool> ExisteConflitoAsync(int idDentista, DateOnly data, TimeOnly hora, int? idExcluido = null)
    {
        var query = _contexto.Consultas
            .Where(c => c.IdDentista == idDentista
                     && c.DataConsulta == data
                     && c.HoraConsulta == hora
                     && c.Status != "Cancelada"
                     && c.Status != "Inativa");

        if (idExcluido.HasValue)
            query = query.Where(c => c.Id != idExcluido.Value);

        return await query.AnyAsync();
    }

    public async Task AdicionarAsync(Consulta consulta)
    {
        _contexto.Consultas.Add(consulta);
        await _contexto.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Consulta consulta)
        => await _contexto.SaveChangesAsync();
}
