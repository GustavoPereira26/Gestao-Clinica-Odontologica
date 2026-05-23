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

    private static ServicoResponse ToResponse(Servico s) =>
        new() { Id = s.Id, Nome = s.Nome, IdEspecialidade = s.IdEspecialidade };

    public async Task<IEnumerable<ServicoResponse>> ListarTodosAsync()
    {
        var lista = await _servicoRepository.ListarTodosAsync();
        return lista.Select(ToResponse);
    }

    public async Task<IEnumerable<ServicoResponse>> ListarPorEspecialidadeAsync(int idEspecialidade)
    {
        var lista = await _servicoRepository.ListarPorEspecialidadeAsync(idEspecialidade);
        return lista.Select(ToResponse);
    }

    public async Task<ServicoResponse?> BuscarPorIdAsync(int id)
    {
        var servico = await _servicoRepository.BuscarPorIdAsync(id);
        return servico is null ? null : ToResponse(servico);
    }

    public async Task<ServicoResponse> CadastrarAsync(ServicoRequest request)
    {
        var servico = new Servico { Nome = request.Nome, IdEspecialidade = request.IdEspecialidade };
        await _servicoRepository.AdicionarAsync(servico);
        return ToResponse(servico);
    }

    public async Task<ServicoResponse?> EditarAsync(int id, ServicoRequest request)
    {
        var servico = await _servicoRepository.BuscarPorIdAsync(id);
        if (servico is null) return null;

        servico.Nome = request.Nome;
        servico.IdEspecialidade = request.IdEspecialidade;
        await _servicoRepository.AtualizarAsync(servico);
        return ToResponse(servico);
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var servico = await _servicoRepository.BuscarPorIdAsync(id);
        if (servico is null) return false;

        await _servicoRepository.RemoverAsync(servico);
        return true;
    }
}
