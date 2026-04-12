using DentusClinic.API.Data;
using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Services;

public class DentistaService : IDentistaService
{
    private readonly AppDbContext _context;

    public DentistaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DentistaResponse>> ListarTodosAsync()
    {
        var lista = await _context.Dentistas
            .Include(d => d.Especialidade)
            .Include(d => d.Login)
            .ToListAsync();
        return lista.Select(MapearResponse);
    }

    public async Task<DentistaResponse?> BuscarPorIdAsync(int id)
    {
        var dentista = await _context.Dentistas
            .Include(d => d.Especialidade)
            .Include(d => d.Login)
            .FirstOrDefaultAsync(d => d.Id == id);
        return dentista is null ? null : MapearResponse(dentista);
    }

    public async Task<DentistaResponse> CadastrarAsync(DentistaRequest request)
    {
        if (await _context.Dentistas.AnyAsync(d => d.Cpf == request.Cpf))
            throw new InvalidOperationException("CPF já cadastrado no sistema.");

        if (await _context.Dentistas.AnyAsync(d => d.Cro == request.Cro))
            throw new InvalidOperationException("CRO já cadastrado no sistema.");

        if (await _context.Logins.AnyAsync(l => l.Email == request.Email))
            throw new InvalidOperationException("E-mail já cadastrado no sistema.");

        var login = new Login
        {
            Email = request.Email,
            Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            TipoAcesso = "Dentista"
        };
        _context.Logins.Add(login);
        await _context.SaveChangesAsync();

        var dentista = new Dentista
        {
            Nome = request.Nome,
            Cpf = request.Cpf,
            Cro = request.Cro,
            Telefone = request.Telefone,
            IdEspecialidade = request.IdEspecialidade,
            IdAcesso = login.Id
        };
        _context.Dentistas.Add(dentista);
        await _context.SaveChangesAsync();

        await _context.Entry(dentista).Reference(d => d.Especialidade).LoadAsync();
        dentista.Login = login;
        return MapearResponse(dentista);
    }

    public async Task<DentistaResponse?> EditarAsync(int id, DentistaRequest request)
    {
        var dentista = await _context.Dentistas
            .Include(d => d.Especialidade)
            .Include(d => d.Login)
            .FirstOrDefaultAsync(d => d.Id == id);
        if (dentista is null) return null;

        if (await _context.Dentistas.AnyAsync(d => d.Cpf == request.Cpf && d.Id != id))
            throw new InvalidOperationException("CPF já cadastrado no sistema.");

        if (await _context.Dentistas.AnyAsync(d => d.Cro == request.Cro && d.Id != id))
            throw new InvalidOperationException("CRO já cadastrado no sistema.");

        dentista.Nome = request.Nome;
        dentista.Cpf = request.Cpf;
        dentista.Cro = request.Cro;
        dentista.Telefone = request.Telefone;
        dentista.IdEspecialidade = request.IdEspecialidade;
        dentista.Login.Email = request.Email;

        if (!string.IsNullOrWhiteSpace(request.Senha))
            dentista.Login.Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha);

        await _context.SaveChangesAsync();
        await _context.Entry(dentista).Reference(d => d.Especialidade).LoadAsync();
        return MapearResponse(dentista);
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var dentista = await _context.Dentistas.Include(d => d.Login).FirstOrDefaultAsync(d => d.Id == id);
        if (dentista is null) return false;

        _context.Dentistas.Remove(dentista);
        _context.Logins.Remove(dentista.Login);
        await _context.SaveChangesAsync();
        return true;
    }

    private static DentistaResponse MapearResponse(Dentista d) => new()
    {
        Id = d.Id,
        Nome = d.Nome,
        Cpf = d.Cpf,
        Cro = d.Cro,
        Telefone = d.Telefone,
        IdEspecialidade = d.IdEspecialidade,
        NomeEspecialidade = d.Especialidade?.Nome ?? string.Empty,
        Email = d.Login?.Email ?? string.Empty
    };
}
