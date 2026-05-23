using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services.Interfaces;

namespace DentusClinic.API.Services;

public class ProntuarioService : IProntuarioService
{
    private readonly IProntuarioRepository _prontuarioRepository;

    public ProntuarioService(IProntuarioRepository prontuarioRepository)
    {
        _prontuarioRepository = prontuarioRepository;
    }

    public async Task<IEnumerable<ProntuarioResponse>> ListarTodosAsync()
    {
        var lista = await _prontuarioRepository.ListarTodosAsync();
        return lista.Select(MapearResponse);
    }

    public async Task<ProntuarioResponse?> BuscarPorIdAsync(int id)
    {
        var prontuario = await _prontuarioRepository.BuscarPorIdAsync(id);
        return prontuario is null ? null : MapearResponse(prontuario);
    }

    public async Task<ProntuarioResponse?> BuscarPorPacienteAsync(int idPaciente)
    {
        var prontuario = await _prontuarioRepository.BuscarPorPacienteAsync(idPaciente);
        return prontuario is null ? null : MapearResponse(prontuario);
    }

    public async Task<ProntuarioResponse> ObterOuCriarAsync(int idPaciente)
    {
        var existente = await _prontuarioRepository.BuscarPorPacienteAsync(idPaciente);
        if (existente is not null) return MapearResponse(existente);

        var novo = new Models.Prontuario { IdPaciente = idPaciente };
        await _prontuarioRepository.AdicionarAsync(novo);
        var criado = await _prontuarioRepository.BuscarPorIdAsync(novo.Id);
        return MapearResponse(criado!);
    }

    private static ProntuarioResponse MapearResponse(Models.Prontuario p) => new()
    {
        Id = p.Id,
        IdPaciente = p.IdPaciente,
        NomePaciente = p.Paciente?.Nome ?? string.Empty,
        DataAbertura = p.DataAbertura,
        DataUltimaAtualizacao = p.DataUltimaAtualizacao
    };
}
