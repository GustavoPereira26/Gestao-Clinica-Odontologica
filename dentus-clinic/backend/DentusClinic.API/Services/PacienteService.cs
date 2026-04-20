using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services.Interfaces;

namespace DentusClinic.API.Services;

public class PacienteService : IPacienteService
{
    private readonly IPacienteRepository _pacienteRepository;
    private readonly IProntuarioRepository _prontuarioRepository;

    public PacienteService(IPacienteRepository pacienteRepository, IProntuarioRepository prontuarioRepository)
    {
        _pacienteRepository = pacienteRepository;
        _prontuarioRepository = prontuarioRepository;
    }

    public async Task<IEnumerable<PacienteResponse>> ListarTodosAsync()
    {
        var lista = await _pacienteRepository.ListarTodosAsync();
        return lista.Select(MapearResponse);
    }

    public async Task<PacienteResponse?> BuscarPorIdAsync(int id)
    {
        var paciente = await _pacienteRepository.BuscarPorIdAsync(id);
        return paciente is null ? null : MapearResponse(paciente);
    }

    public async Task<PacienteResponse> CadastrarAsync(PacienteRequest request)
    {
        if (await _pacienteRepository.ExisteCpfAsync(request.Cpf))
            throw new InvalidOperationException("CPF já cadastrado no sistema.");

        if (await _pacienteRepository.ExisteEmailAsync(request.Email))
            throw new InvalidOperationException("E-mail já cadastrado no sistema.");

        var paciente = new Paciente
        {
            Nome = request.Nome,
            Cpf = request.Cpf,
            Telefone = request.Telefone,
            Email = request.Email,
            DataNascimento = request.DataNascimento,
            Endereco = request.Endereco
        };

        await _pacienteRepository.AdicionarAsync(paciente);

        // Prontuário criado automaticamente ao cadastrar paciente
        var prontuario = new Prontuario
        {
            IdPaciente = paciente.Id,
            DataAbertura = DateOnly.FromDateTime(DateTime.Today)
        };
        await _prontuarioRepository.AdicionarAsync(prontuario);

        return MapearResponse(paciente);
    }

    public async Task<PacienteResponse?> EditarAsync(int id, PacienteRequest request)
    {
        var paciente = await _pacienteRepository.BuscarPorIdAsync(id);
        if (paciente is null) return null;

        if (await _pacienteRepository.ExisteCpfAsync(request.Cpf, id))
            throw new InvalidOperationException("CPF já cadastrado no sistema.");

        if (await _pacienteRepository.ExisteEmailAsync(request.Email, id))
            throw new InvalidOperationException("E-mail já cadastrado no sistema.");

        paciente.Nome = request.Nome;
        paciente.Cpf = request.Cpf;
        paciente.Telefone = request.Telefone;
        paciente.Email = request.Email;
        paciente.DataNascimento = request.DataNascimento;
        paciente.Endereco = request.Endereco;

        await _pacienteRepository.AtualizarAsync(paciente);
        return MapearResponse(paciente);
    }

    public async Task<bool> InativarAsync(int id)
    {
        var paciente = await _pacienteRepository.BuscarPorIdAsync(id);
        if (paciente is null) return false;

        await _pacienteRepository.InativarAsync(paciente);
        return true;
    }

    private static PacienteResponse MapearResponse(Paciente p) => new()
    {
        Id = p.Id,
        Nome = p.Nome,
        Cpf = p.Cpf,
        Telefone = p.Telefone,
        Email = p.Email,
        DataNascimento = p.DataNascimento,
        Endereco = p.Endereco,
        Ativo = p.Ativo
    };
}
