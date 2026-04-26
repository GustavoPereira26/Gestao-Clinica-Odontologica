using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Enums;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services.Interfaces;

namespace DentusClinic.API.Services;

public class FuncionarioService : IFuncionarioService
{
    private readonly IFuncionarioRepository _funcionarioRepository;
    private readonly ILoginRepository _loginRepository;

    public FuncionarioService(IFuncionarioRepository funcionarioRepository, ILoginRepository loginRepository)
    {
        _funcionarioRepository = funcionarioRepository;
        _loginRepository = loginRepository;
    }

    public async Task<IEnumerable<FuncionarioResponse>> ListarTodosAsync()
    {
        var lista = await _funcionarioRepository.ListarTodosAsync();
        return lista.Select(MapearResponse);
    }

    public async Task<FuncionarioResponse?> BuscarPorIdAsync(int id)
    {
        var funcionario = await _funcionarioRepository.BuscarPorIdAsync(id);
        return funcionario is null ? null : MapearResponse(funcionario);
    }

    public async Task<FuncionarioResponse> CadastrarAsync(FuncionarioRequest request)
    {
        if (await _funcionarioRepository.ExisteCpfAsync(request.Cpf))
            throw new InvalidOperationException("CPF já cadastrado no sistema.");

        if (await _loginRepository.ExisteEmailAsync(request.Email))
            throw new InvalidOperationException("E-mail já cadastrado no sistema.");

        if (!Enum.TryParse<TiposAcessoEnum>(request.Cargo, ignoreCase: true, out var tipoAcesso))
            throw new InvalidOperationException("Cargo inválido.");

        var login = new Login
        {
            Email = request.Email,
            Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            TipoAcesso = tipoAcesso
        };
        await _loginRepository.AdicionarAsync(login);

        var funcionario = new Funcionario
        {
            Nome = request.Nome,
            Cpf = request.Cpf,
            DataNascimento = request.DataNascimento,
            Telefone = request.Telefone ?? string.Empty,
            Cargo = request.Cargo,
            IdAcesso = (int)login.Id!
        };
        await _funcionarioRepository.AdicionarAsync(funcionario);

        funcionario.Login = login;
        return MapearResponse(funcionario);
    }

    public async Task<FuncionarioResponse?> EditarAsync(int id, FuncionarioUpdateRequest request)
    {
        var funcionario = await _funcionarioRepository.BuscarPorIdAsync(id);
        if (funcionario is null) return null;

        if (request.Cargo is not null)
        {
            if (!Enum.TryParse<TiposAcessoEnum>(request.Cargo, ignoreCase: true, out var tipoAcesso))
                throw new InvalidOperationException("Cargo inválido.");
            funcionario.Cargo = request.Cargo;
            funcionario.Login.TipoAcesso = tipoAcesso;
        }

        if (request.Nome is not null) funcionario.Nome = request.Nome;
        if (request.DataNascimento is not null) funcionario.DataNascimento = request.DataNascimento.Value;
        if (request.Telefone is not null) funcionario.Telefone = request.Telefone;
        if (request.Email is not null) funcionario.Login.Email = request.Email;
        if (!string.IsNullOrWhiteSpace(request.Senha))
            funcionario.Login.Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha);

        await _funcionarioRepository.AtualizarAsync(funcionario);
        return MapearResponse(funcionario);
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var funcionario = await _funcionarioRepository.BuscarPorIdAsync(id);
        if (funcionario is null) return false;

        var login = funcionario.Login;
        await _funcionarioRepository.RemoverAsync(funcionario);
        await _loginRepository.RemoverAsync(login);
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
