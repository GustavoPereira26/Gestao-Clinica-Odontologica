using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services.Interfaces;

namespace DentusClinic.API.Services;

public class PlanosService : IPlanosService
{
    private readonly IPlanosRepository _planosRepository;

    public PlanosService(IPlanosRepository planosRepository)
    {
        _planosRepository = planosRepository;
    }

    public async Task<IEnumerable<PlanosResponse>> ListarTodosAsync()
    {
        var lista = await _planosRepository.ListarTodosAsync();
        return lista.Select(MapearResponse);
    }

    public async Task<PlanosResponse?> BuscarPorIdAsync(int id)
    {
        var plano = await _planosRepository.BuscarPorIdAsync(id);
        return plano is null ? null : MapearResponse(plano);
    }

    public async Task<PlanosResponse> CadastrarAsync(PlanosRequest request)
    {
        var plano = new Planos
        {
            IdProntuario = request.IdProntuario,
            IdServico = request.IdServico,
            Descricao = request.Descricao,
            Condicao = request.Condicao,
            Status = request.Status,
            Observacao = request.Observacao
        };

        await _planosRepository.AdicionarAsync(plano);

        var planoSalvo = await _planosRepository.BuscarPorIdAsync(plano.Id);
        return MapearResponse(planoSalvo!);
    }

    public async Task<PlanosResponse?> EditarAsync(int id, PlanosRequest request)
    {
        var plano = await _planosRepository.BuscarPorIdAsync(id);
        if (plano is null) return null;

        plano.IdServico = request.IdServico;
        plano.Descricao = request.Descricao;
        plano.Condicao = request.Condicao;
        plano.Status = request.Status;
        plano.Observacao = request.Observacao;

        await _planosRepository.AtualizarAsync(plano);

        var planoAtualizado = await _planosRepository.BuscarPorIdAsync(id);
        return MapearResponse(planoAtualizado!);
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var plano = await _planosRepository.BuscarPorIdAsync(id);
        if (plano is null) return false;

        await _planosRepository.RemoverAsync(plano);
        return true;
    }

    private static PlanosResponse MapearResponse(Planos p) => new()
    {
        Id = p.Id,
        IdProntuario = p.IdProntuario,
        IdServico = p.IdServico,
        NomeServico = p.Servico?.Nome ?? string.Empty,
        Descricao = p.Descricao,
        Condicao = p.Condicao,
        Status = p.Status,
        Observacao = p.Observacao
    };
}
