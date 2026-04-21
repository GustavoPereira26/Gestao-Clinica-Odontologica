using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Enums;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services.Interfaces;

namespace DentusClinic.API.Services;

public class DentistaService : IDentistaService
{
    private readonly IDentistaRepository _dentistaRepository;
    private readonly ILoginRepository _loginRepository;

    public DentistaService(IDentistaRepository dentistaRepository, ILoginRepository loginRepository)
    {
        _dentistaRepository = dentistaRepository;
        _loginRepository = loginRepository;
    }

    public async Task<IEnumerable<DentistaResponse>> ListarTodosAsync()
    {
        var lista = await _dentistaRepository.ListarTodosAsync();
        return lista.Select(MapearResponse);
    }

    public async Task<DentistaResponse?> BuscarPorIdAsync(int id)
    {
        var dentista = await _dentistaRepository.BuscarPorIdAsync(id);
        return dentista is null ? null : MapearResponse(dentista);
    }

    public async Task<DentistaResponse> CadastrarAsync(DentistaRequest request)
    {
        if (await _dentistaRepository.ExisteCpfAsync(request.Cpf))
            throw new InvalidOperationException("CPF já cadastrado no sistema.");

        if (await _dentistaRepository.ExisteCroAsync(request.Cro))
            throw new InvalidOperationException("CRO já cadastrado no sistema.");

        if (await _loginRepository.ExisteEmailAsync(request.Email))
            throw new InvalidOperationException("E-mail já cadastrado no sistema.");

        var login = new Login
        {
            Email = request.Email,
            Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            TipoAcesso = TiposAcessoEnum.DENTISTA
        };
        await _loginRepository.AdicionarAsync(login);

        var dentista = new Dentista
        {
            Nome = request.Nome,
            Cpf = request.Cpf,
            Cro = request.Cro,
            Telefone = request.Telefone ?? string.Empty,
            IdEspecialidade = request.IdEspecialidade,
            IdAcesso = (int)login.Id
        };
        await _dentistaRepository.AdicionarAsync(dentista);

        var dentistaSalvo = await _dentistaRepository.BuscarPorIdAsync(dentista.Id);
        return MapearResponse(dentistaSalvo!);
    }

    public async Task<DentistaResponse?> EditarAsync(int id, DentistaUpdateRequest request)
    {
        var dentista = await _dentistaRepository.BuscarPorIdAsync(id);
        if (dentista is null) return null;

        if (request.Nome is not null) dentista.Nome = request.Nome;
        if (request.Telefone is not null) dentista.Telefone = request.Telefone;
        if (request.IdEspecialidade is not null) dentista.IdEspecialidade = request.IdEspecialidade.Value;
        if (request.Email is not null) dentista.Login.Email = request.Email;
        if (!string.IsNullOrWhiteSpace(request.Senha))
            dentista.Login.Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha);

        await _dentistaRepository.AtualizarAsync(dentista);

        var dentistaAtualizado = await _dentistaRepository.BuscarPorIdAsync(id);
        return MapearResponse(dentistaAtualizado!);
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var dentista = await _dentistaRepository.BuscarPorIdAsync(id);
        if (dentista is null) return false;

        var login = dentista.Login;
        await _dentistaRepository.RemoverAsync(dentista);
        await _loginRepository.RemoverAsync(login);
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
