using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services.Interfaces;

namespace DentusClinic.API.Services;

public class ServicoService : IServicoService
{
    private readonly IServicoRepository _servicoRepository;

    public ServicoService(IServicoRepository servicoRepository)
    {
        _servicoRepository = servicoRepository;
    }

    public async Task<IEnumerable<ServicoResponse>> ListarTodosAsync()
    {
        var lista = await _servicoRepository.ListarTodosAsync();
        return lista.Select(s => new ServicoResponse { Id = s.Id, Nome = s.Nome });
    }

    public async Task<ServicoResponse?> BuscarPorIdAsync(int id)
    {
        var servico = await _servicoRepository.BuscarPorIdAsync(id);
        return servico is null ? null : new ServicoResponse { Id = servico.Id, Nome = servico.Nome };
    }

    public async Task<ServicoResponse> CadastrarAsync(ServicoRequest request)
    {
        var servico = new Servico { Nome = request.Nome };
        await _servicoRepository.AdicionarAsync(servico);
        return new ServicoResponse { Id = servico.Id, Nome = servico.Nome };
    }

    public async Task<ServicoResponse?> EditarAsync(int id, ServicoRequest request)
    {
        var servico = await _servicoRepository.BuscarPorIdAsync(id);
        if (servico is null) return null;

        servico.Nome = request.Nome;
        await _servicoRepository.AtualizarAsync(servico);
        return new ServicoResponse { Id = servico.Id, Nome = servico.Nome };
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var servico = await _servicoRepository.BuscarPorIdAsync(id);
        if (servico is null) return false;

        await _servicoRepository.RemoverAsync(servico);
        return true;
    }
}
