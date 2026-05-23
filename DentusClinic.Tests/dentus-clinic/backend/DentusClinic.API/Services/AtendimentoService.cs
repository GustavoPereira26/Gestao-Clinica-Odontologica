using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services.Interfaces;

namespace DentusClinic.API.Services;

public class AtendimentoService : IAtendimentoService
{
    private readonly IAtendimentoRepository _atendimentoRepository;
    private readonly IConsultaRepository _consultaRepository;

    public AtendimentoService(IAtendimentoRepository atendimentoRepository, IConsultaRepository consultaRepository)
    {
        _atendimentoRepository = atendimentoRepository;
        _consultaRepository = consultaRepository;
    }

    public async Task<IEnumerable<AtendimentoResponse>> ListarTodosAsync()
    {
        var lista = await _atendimentoRepository.ListarTodosAsync();
        return lista.Select(MapearResponse);
    }

    public async Task<AtendimentoResponse?> BuscarPorIdAsync(int id)
    {
        var atendimento = await _atendimentoRepository.BuscarPorIdAsync(id);
        return atendimento is null ? null : MapearResponse(atendimento);
    }

    public async Task<AtendimentoResponse> RegistrarAsync(AtendimentoRequest request)
    {
        // Regra: atendimento só pode ser registrado vinculado a consulta existente
        var consulta = await _consultaRepository.BuscarPorIdAsync(request.IdConsulta)
            ?? throw new InvalidOperationException("Consulta não encontrada.");

        if (await _atendimentoRepository.ExistePorConsultaAsync(request.IdConsulta))
            throw new InvalidOperationException("Já existe um atendimento registrado para esta consulta.");

        var atendimento = new Atendimento
        {
            IdConsulta = request.IdConsulta,
            Descricao = request.Descricao,
            ProcedimentoRealizado = request.ProcedimentoRealizado,
            DataAtendimento = request.DataAtendimento,
            Observacao = request.Observacao
        };

        consulta.Status = "Concluida";
        await _consultaRepository.AtualizarAsync(consulta);

        await _atendimentoRepository.AdicionarAsync(atendimento);
        return MapearResponse(atendimento);
    }

    public async Task<AtendimentoResponse?> EditarAsync(int id, AtendimentoRequest request)
    {
        var atendimento = await _atendimentoRepository.BuscarPorIdAsync(id);
        if (atendimento is null) return null;

        atendimento.Descricao = request.Descricao;
        atendimento.ProcedimentoRealizado = request.ProcedimentoRealizado;
        atendimento.DataAtendimento = request.DataAtendimento;
        atendimento.Observacao = request.Observacao;

        await _atendimentoRepository.AtualizarAsync(atendimento);
        return MapearResponse(atendimento);
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var atendimento = await _atendimentoRepository.BuscarPorIdAsync(id);
        if (atendimento is null) return false;

        await _atendimentoRepository.RemoverAsync(atendimento);
        return true;
    }

    private static AtendimentoResponse MapearResponse(Atendimento a) => new()
    {
        Id = a.Id,
        IdConsulta = a.IdConsulta,
        Descricao = a.Descricao,
        ProcedimentoRealizado = a.ProcedimentoRealizado,
        DataAtendimento = a.DataAtendimento,
        Observacao = a.Observacao
    };
}
