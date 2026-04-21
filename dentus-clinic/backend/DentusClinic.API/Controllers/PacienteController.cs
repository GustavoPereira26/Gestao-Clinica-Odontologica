using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Services.Interfaces;
using DentusClinic.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentusClinic.API.Controllers;

[ApiController]
[Route("api/pacientes")]
[Authorize]
public class PacienteController : ControllerBase
{
    private readonly IPacienteService _pacienteService;

    public PacienteController(IPacienteService pacienteService)
    {
        _pacienteService = pacienteService;
    }

    [HttpGet]
    [Authorize(Roles = "SECRETARIA")]
    public async Task<IActionResult> ListarTodos()
    {
        var pacientes = await _pacienteService.ListarTodosAsync();
        return Ok(ApiResponse<object>.Ok(pacientes));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "SECRETARIA")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var paciente = await _pacienteService.BuscarPorIdAsync(id);
        if (paciente is null)
            return NotFound(ApiResponse<object>.Erro("Paciente não encontrado."));

        return Ok(ApiResponse<object>.Ok(paciente));
    }

    [HttpPost("cadastrar")]
    [Authorize(Roles = "SECRETARIA")]
    public async Task<IActionResult> Cadastrar([FromBody] PacienteRequest request)
    {
        var paciente = await _pacienteService.CadastrarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = paciente.Id },
            ApiResponse<object>.Ok(paciente, "Paciente cadastrado com sucesso."));
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "SECRETARIA")]
    public async Task<IActionResult> Editar(int id, [FromBody] PacienteUpdateRequest request)
    {
        var paciente = await _pacienteService.EditarAsync(id, request);
        if (paciente is null)
            return NotFound(ApiResponse<object>.Erro("Paciente não encontrado."));

        return Ok(ApiResponse<object>.Ok(paciente, "Paciente atualizado com sucesso."));
    }

    [HttpPatch("{id}/inativar")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Inativar(int id)
    {
        var inativado = await _pacienteService.InativarAsync(id);
        if (!inativado)
            return NotFound(ApiResponse<object>.Erro("Paciente não encontrado."));

        return Ok(ApiResponse<object>.Ok("Paciente inativado com sucesso."));
    }
}
