using DentusClinic.API.Data;
using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Services;

public class FuncionarioService : IFuncionarioService
{
    private readonly AppDbContext _context;

    public FuncionarioService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FuncionarioResponse>> ListarTodosAsync()
    {
        return await _context.Funcionarios
            .Include(f => f.Login)
            .Select(f => MapearResponse(f))
            .ToListAsync();
    }

    public async Task<FuncionarioResponse?> BuscarPorIdAsync(int id)
    {
        var funcionario = await _context.Funcionarios.Include(f => f.Login).FirstOrDefaultAsync(f => f.Id == id);
        return funcionario is null ? null : MapearResponse(funcionario);
    }

    public async Task<FuncionarioResponse> CadastrarAsync(FuncionarioRequest request)
    {
        if (await _context.Funcionarios.AnyAsync(f => f.Cpf == request.Cpf))
            throw new InvalidOperationException("CPF já cadastrado no sistema.");

        if (await _context.Logins.AnyAsync(l => l.Email == request.Email))
            throw new InvalidOperationException("E-mail já cadastrado no sistema.");

        var login = new Login
        {
            Email = request.Email,
            Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            TipoAcesso = request.Cargo
        };
        _context.Logins.Add(login);
        await _context.SaveChangesAsync();

        var funcionario = new Funcionario
        {
            Nome = request.Nome,
            Cpf = request.Cpf,
            DataNascimento = request.DataNascimento,
            Telefone = request.Telefone,
            Cargo = request.Cargo,
            IdAcesso = login.Id
        };
        _context.Funcionarios.Add(funcionario);
        await _context.SaveChangesAsync();

        funcionario.Login = login;
        return MapearResponse(funcionario);
    }

    public async Task<FuncionarioResponse?> EditarAsync(int id, FuncionarioRequest request)
    {
        var funcionario = await _context.Funcionarios.Include(f => f.Login).FirstOrDefaultAsync(f => f.Id == id);
        if (funcionario is null) return null;

        if (await _context.Funcionarios.AnyAsync(f => f.Cpf == request.Cpf && f.Id != id))
            throw new InvalidOperationException("CPF já cadastrado no sistema.");

        funcionario.Nome = request.Nome;
        funcionario.Cpf = request.Cpf;
        funcionario.DataNascimento = request.DataNascimento;
        funcionario.Telefone = request.Telefone;
        funcionario.Cargo = request.Cargo;
        funcionario.Login.Email = request.Email;
        funcionario.Login.TipoAcesso = request.Cargo;

        if (!string.IsNullOrWhiteSpace(request.Senha))
            funcionario.Login.Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha);

        await _context.SaveChangesAsync();
        return MapearResponse(funcionario);
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var funcionario = await _context.Funcionarios.Include(f => f.Login).FirstOrDefaultAsync(f => f.Id == id);
        if (funcionario is null) return false;

        _context.Funcionarios.Remove(funcionario);
        _context.Logins.Remove(funcionario.Login);
        await _context.SaveChangesAsync();
        return true;
    }

    private static FuncionarioResponse MapearResponse(Funcionario f) => new()
    {
        Id = f.Id,
        Nome = f.Nome,
        Cpf = f.Cpf,
        DataNascimento = f.DataNascimento,
        Telefone = f.Telefone,
        Cargo = f.Cargo,
        Email = f.Login?.Email ?? string.Empty
    };
}
