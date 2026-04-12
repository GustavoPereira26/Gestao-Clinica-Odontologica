using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentusClinic.API.Controllers;

[ApiController]
[Route("api/prontuarios")]
[Authorize]
public class ProntuarioController : ControllerBase
{
    private readonly IProntuarioService _prontuarioService;

    public ProntuarioController(IProntuarioService prontuarioService)
    {
        _prontuarioService = prontuarioService;
    }

    [HttpGet]
    public async Task<IActionResult> ListarTodos()
    {
        var prontuarios = await _prontuarioService.ListarTodosAsync();
        return Ok(ApiResponse<object>.Ok(prontuarios));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var prontuario = await _prontuarioService.BuscarPorIdAsync(id);
        if (prontuario is null)
            return NotFound(ApiResponse<object>.Erro("Prontuário não encontrado."));

        return Ok(ApiResponse<object>.Ok(prontuario));
    }

    [HttpGet("paciente/{idPaciente}")]
    public async Task<IActionResult> BuscarPorPaciente(int idPaciente)
    {
        var prontuario = await _prontuarioService.BuscarPorPacienteAsync(idPaciente);
        if (prontuario is null)
            return NotFound(ApiResponse<object>.Erro("Prontuário não encontrado para este paciente."));

        return Ok(ApiResponse<object>.Ok(prontuario));
    }
}
