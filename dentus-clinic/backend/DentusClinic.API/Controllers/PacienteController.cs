using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Interfaces;
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
    public async Task<IActionResult> ListarTodos()
    {
        var pacientes = await _pacienteService.ListarTodosAsync();
        return Ok(ApiResponse<object>.Ok(pacientes));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var paciente = await _pacienteService.BuscarPorIdAsync(id);
        if (paciente is null)
            return NotFound(ApiResponse<object>.Erro("Paciente não encontrado."));

        return Ok(ApiResponse<object>.Ok(paciente));
    }

    [HttpPost]
    public async Task<IActionResult> Cadastrar([FromBody] PacienteRequest request)
    {
        var paciente = await _pacienteService.CadastrarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = paciente.Id },
            ApiResponse<object>.Ok(paciente, "Paciente cadastrado com sucesso."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, [FromBody] PacienteRequest request)
    {
        var paciente = await _pacienteService.EditarAsync(id, request);
        if (paciente is null)
            return NotFound(ApiResponse<object>.Erro("Paciente não encontrado."));

        return Ok(ApiResponse<object>.Ok(paciente, "Paciente atualizado com sucesso."));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Remover(int id)
    {
        var removido = await _pacienteService.RemoverAsync(id);
        if (!removido)
            return NotFound(ApiResponse<object>.Erro("Paciente não encontrado."));

        return Ok(ApiResponse<object>.Ok(null, "Paciente removido com sucesso."));
    }
}
