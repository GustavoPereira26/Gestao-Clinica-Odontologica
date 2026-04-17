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

    private static ProntuarioResponse MapearResponse(Models.Prontuario p) => new()
    {
        Id = p.Id,
        IdPaciente = p.IdPaciente,
        NomePaciente = p.Paciente?.Nome ?? string.Empty,
        DataAbertura = p.DataAbertura
    };
}
