using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;

namespace DentusClinic.API.Services.Interfaces;

public interface IConsultaService
{
    Task<IEnumerable<ConsultaResponse>> ListarTodosAsync();
    Task<IEnumerable<ConsultaResponse>> ListarHojeAsync();
    Task<ConsultaResponse?> BuscarPorIdAsync(int id);
    Task<ConsultaResponse> AgendarAsync(ConsultaRequest request);
    Task<ConsultaResponse?> EditarAsync(int id, ConsultaUpdateRequest request);
    Task<bool> RegistrarChegadaAsync(int id);
    Task<bool> AtualizarStatusAsync(int id, string novoStatus);
    Task<bool> CancelarAsync(int id);
    Task<bool> InativarAsync(int id);
}
