using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services.Interfaces;

namespace DentusClinic.API.Services;

public class EspecialidadeService : IEspecialidadeService
{
    private readonly IEspecialidadeRepository _especialidadeRepository;

    public EspecialidadeService(IEspecialidadeRepository especialidadeRepository)
    {
        _especialidadeRepository = especialidadeRepository;
    }

    public async Task<IEnumerable<EspecialidadeResponse>> ListarTodosAsync()
    {
        var lista = await _especialidadeRepository.ListarTodosAsync();
        return lista.Select(e => new EspecialidadeResponse { Id = e.Id, Nome = e.Nome });
    }

    public async Task<EspecialidadeResponse?> BuscarPorIdAsync(int id)
    {
        var esp = await _especialidadeRepository.BuscarPorIdAsync(id);
        return esp is null ? null : new EspecialidadeResponse { Id = esp.Id, Nome = esp.Nome };
    }

    public async Task<EspecialidadeResponse> CadastrarAsync(EspecialidadeRequest request)
    {
        var esp = new Especialidade { Nome = request.Nome };
        await _especialidadeRepository.AdicionarAsync(esp);
        return new EspecialidadeResponse { Id = esp.Id, Nome = esp.Nome };
    }

    public async Task<EspecialidadeResponse?> EditarAsync(int id, EspecialidadeRequest request)
    {
        var esp = await _especialidadeRepository.BuscarPorIdAsync(id);
        if (esp is null) return null;

        esp.Nome = request.Nome;
        await _especialidadeRepository.AtualizarAsync(esp);
        return new EspecialidadeResponse { Id = esp.Id, Nome = esp.Nome };
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var esp = await _especialidadeRepository.BuscarPorIdAsync(id);
        if (esp is null) return false;

        await _especialidadeRepository.RemoverAsync(esp);
        return true;
    }
}
