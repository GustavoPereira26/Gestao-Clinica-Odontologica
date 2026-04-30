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

    public async Task<IEnumerable<ConsultaResponse>> ListarHojeAsync()
    {
        var lista = await _consultaRepository.ListarHojeAsync();
        return lista.Select(MapearResponse);
    }

    public async Task<ConsultaResponse?> BuscarPorIdAsync(int id)
    {
        var consulta = await _consultaRepository.BuscarPorIdAsync(id);
        return consulta is null ? null : MapearResponse(consulta);
    }

    public async Task<ConsultaResponse> AgendarAsync(ConsultaRequest request)
    {
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var horaAgora = TimeOnly.FromDateTime(DateTime.Now);

        if (request.DataConsulta < hoje)
            throw new InvalidOperationException("Não é possível agendar uma consulta em uma data passada.");

        if (request.DataConsulta == hoje && request.HoraConsulta < horaAgora)
            throw new InvalidOperationException("Não é possível agendar uma consulta em um horário que já passou.");

        var paciente = await _pacienteRepository.BuscarPorIdAsync(request.IdPaciente)
            ?? throw new InvalidOperationException("Paciente não encontrado.");

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
            IdServico = request.IdServico ?? null
        };

        await _consultaRepository.AdicionarAsync(consulta);

        var consultaSalva = await _consultaRepository.BuscarPorIdAsync(consulta.Id);
        return MapearResponse(consultaSalva!);
    }

    public async Task<ConsultaResponse?> EditarAsync(int id, ConsultaUpdateRequest request)
    {
        var consulta = await _consultaRepository.BuscarPorIdAsync(id);
        if (consulta is null) return null;

        var idDentista = request.IdDentista ?? consulta.IdDentista;
        var data = request.DataConsulta ?? consulta.DataConsulta;
        var hora = request.HoraConsulta ?? consulta.HoraConsulta;

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var horaAgora = TimeOnly.FromDateTime(DateTime.Now);

        if (request.DataConsulta is not null && request.DataConsulta.Value < hoje)
            throw new InvalidOperationException("Não é possível alterar uma consulta para uma data passada.");

        if (request.DataConsulta is not null && request.DataConsulta.Value == hoje && request.HoraConsulta is not null && request.HoraConsulta.Value < horaAgora)
            throw new InvalidOperationException("Não é possível alterar uma consulta para um horário que já passou.");

        if (await _consultaRepository.ExisteConflitoAsync(idDentista, data, hora, id))
            throw new InvalidOperationException("Dentista já possui consulta agendada nesse horário.");

        if (request.DataConsulta is not null) consulta.DataConsulta = request.DataConsulta.Value;
        if (request.HoraConsulta is not null) consulta.HoraConsulta = request.HoraConsulta.Value;
        if (request.Retorno is not null) consulta.Retorno = request.Retorno.Value;
        if (request.IdDentista is not null) consulta.IdDentista = request.IdDentista.Value;
        if (request.IdPaciente is not null) consulta.IdPaciente = request.IdPaciente.Value;
        if (request.IdServico is not null) consulta.IdServico = request.IdServico.Value;

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

    public async Task<bool> AtualizarStatusAsync(int id, string novoStatus)
    {
        string[] validos = ["Agendada", "Aguardando", "Em Consulta", "Encerrada"];
        if (!validos.Contains(novoStatus)) return false;

        var consulta = await _consultaRepository.BuscarPorIdAsync(id);
        if (consulta is null || consulta.Status == "Cancelada" || consulta.Status == "Inativa") return false;

        consulta.Status = novoStatus;
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

    public async Task<bool> InativarAsync(int id)
    {
        var consulta = await _consultaRepository.BuscarPorIdAsync(id);
        if (consulta is null) return false;

        consulta.Status = "Inativa";
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
        IdDentista = c.IdDentista,
        IdPaciente = c.IdPaciente,
        IdServico = c.IdServico,
        NomeDentista = c.Dentista?.Nome ?? string.Empty,
        NomePaciente = c.Paciente?.Nome ?? string.Empty,
        NomeServico = c.Servico?.Nome ?? string.Empty
    };
}
