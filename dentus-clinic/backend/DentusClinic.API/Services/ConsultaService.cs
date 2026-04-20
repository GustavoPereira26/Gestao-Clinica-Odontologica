using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services.Interfaces;

namespace DentusClinic.API.Services;

public class ConsultaService : IConsultaService
{
    private readonly IConsultaRepository _consultaRepository;
    private readonly IPacienteRepository _pacienteRepository;

    public ConsultaService(IConsultaRepository consultaRepository, IPacienteRepository pacienteRepository)
    {
        _consultaRepository = consultaRepository;
        _pacienteRepository = pacienteRepository;
    }

    public async Task<IEnumerable<ConsultaResponse>> ListarTodosAsync()
    {
        var lista = await _consultaRepository.ListarTodosAsync();
        return lista.Select(MapearResponse);
    }

    public async Task<ConsultaResponse?> BuscarPorIdAsync(int id)
    {
        var consulta = await _consultaRepository.BuscarPorIdAsync(id);
        return consulta is null ? null : MapearResponse(consulta);
    }

    public async Task<ConsultaResponse> AgendarAsync(ConsultaRequest request)
    {
        // Regra: paciente deve estar cadastrado
        var paciente = await _pacienteRepository.BuscarPorIdAsync(request.IdPaciente)
            ?? throw new InvalidOperationException("Paciente não encontrado.");

        // Regra: dentista não pode ter duas consultas no mesmo horário na mesma data
        if (await _consultaRepository.ExisteConflitoAsync(request.IdDentista, request.DataConsulta, request.HoraConsulta))
            throw new InvalidOperationException("Dentista já possui consulta agendada nesse horário.");

        var consulta = new Consulta
        {
            DataConsulta = request.DataConsulta,
            HoraConsulta = request.HoraConsulta,
            Retorno = request.Retorno,
            Status = "Agendada",
            IdDentista = request.IdDentista,
            IdPaciente = request.IdPaciente,
            IdServico = request.IdServico
        };

        await _consultaRepository.AdicionarAsync(consulta);

        var consultaSalva = await _consultaRepository.BuscarPorIdAsync(consulta.Id);
        return MapearResponse(consultaSalva!);
    }

    public async Task<ConsultaResponse?> EditarAsync(int id, ConsultaRequest request)
    {
        var consulta = await _consultaRepository.BuscarPorIdAsync(id);
        if (consulta is null) return null;

        if (await _consultaRepository.ExisteConflitoAsync(request.IdDentista, request.DataConsulta, request.HoraConsulta, id))
            throw new InvalidOperationException("Dentista já possui consulta agendada nesse horário.");

        consulta.DataConsulta = request.DataConsulta;
        consulta.HoraConsulta = request.HoraConsulta;
        consulta.Retorno = request.Retorno;
        consulta.IdDentista = request.IdDentista;
        consulta.IdPaciente = request.IdPaciente;
        consulta.IdServico = request.IdServico;

        await _consultaRepository.AtualizarAsync(consulta);

        var consultaAtualizada = await _consultaRepository.BuscarPorIdAsync(id);
        return MapearResponse(consultaAtualizada!);
    }

    public async Task<bool> RegistrarChegadaAsync(int id)
    {
        var consulta = await _consultaRepository.BuscarPorIdAsync(id);
        if (consulta is null) return false;

        consulta.Status = "Aguardando";
        await _consultaRepository.AtualizarAsync(consulta);
        return true;
    }

    public async Task<bool> CancelarAsync(int id)
    {
        var consulta = await _consultaRepository.BuscarPorIdAsync(id);
        if (consulta is null) return false;

        consulta.Status = "Cancelada";
        await _consultaRepository.AtualizarAsync(consulta);
        return true;
    }

    private static ConsultaResponse MapearResponse(Consulta c) => new()
    {
        Id = c.Id,
        DataConsulta = c.DataConsulta,
        HoraConsulta = c.HoraConsulta,
        Retorno = c.Retorno,
        Status = c.Status,
        NomeDentista = c.Dentista?.Nome ?? string.Empty,
        NomePaciente = c.Paciente?.Nome ?? string.Empty,
        NomeServico = c.Servico?.Nome ?? string.Empty
    };
}
