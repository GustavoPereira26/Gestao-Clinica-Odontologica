using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Models;
using DentusClinic.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentusClinic.API.Controllers;

[ApiController]
[Route("api/consultas")]
[Authorize]
public class ConsultaController : ControllerBase
{
    private readonly IConsultaService _consultaService;

    public ConsultaController(IConsultaService consultaService)
    {
        _consultaService = consultaService;
    }

    [HttpGet]
    [Authorize(Roles = "DENTISTA, SECRETARIA")]
    public async Task<IActionResult> ListarTodos()
    {
        var consultas = await _consultaService.ListarTodosAsync();
        return Ok(ApiResponse<object>.Ok(consultas));
    }

    [HttpGet("hoje")]
    [Authorize(Roles = "DENTISTA, SECRETARIA")]
    public async Task<IActionResult> ListarHoje()
    {
        var consultas = await _consultaService.ListarHojeAsync();
        return Ok(ApiResponse<object>.Ok(consultas));
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "SECRETARIA")]
    public async Task<IActionResult> AtualizarStatus(int id, [FromBody] AtualizarStatusRequest request)
    {
        var sucesso = await _consultaService.AtualizarStatusAsync(id, request.Status);
        if (!sucesso)
            return BadRequest(ApiResponse<object>.Erro("Status inválido ou consulta não pode ser alterada."));
        return Ok(ApiResponse<object>.Ok("Status atualizado com sucesso."));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "DENTISTA, SECRETARIA")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var consulta = await _consultaService.BuscarPorIdAsync(id);
        if (consulta is null)
            return NotFound(ApiResponse<object>.Erro("Consulta não encontrada."));

        return Ok(ApiResponse<object>.Ok(consulta));
    }

    [HttpPost("agendar")]
    [Authorize(Roles = "SECRETARIA")]
    public async Task<IActionResult> Agendar([FromBody] ConsultaRequest request)
    {
        var consulta = await _consultaService.AgendarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = consulta.Id },
            ApiResponse<object>.Ok(consulta, "Consulta agendada com sucesso."));
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "SECRETARIA")]
    public async Task<IActionResult> Editar(int id, [FromBody] ConsultaUpdateRequest request)
    {
        var consulta = await _consultaService.EditarAsync(id, request);
        if (consulta is null)
            return NotFound(ApiResponse<object>.Erro("Consulta não encontrada."));

        return Ok(ApiResponse<object>.Ok(consulta, "Consulta atualizada com sucesso."));
    }

    [HttpPut("{id}/chegada")]
    [Authorize(Roles = "SECRETARIA")]
    public async Task<IActionResult> RegistrarChegada(int id)
    {
        var sucesso = await _consultaService.RegistrarChegadaAsync(id);
        if (!sucesso)
            return NotFound(ApiResponse<object>.Erro("Consulta não encontrada."));

        return Ok(ApiResponse<object>.Ok("Chegada do paciente registrada."));
    }

    [HttpPut("{id}/cancelar")]
    [Authorize(Roles = "SECRETARIA")]
    public async Task<IActionResult> Cancelar(int id)
    {
        var sucesso = await _consultaService.CancelarAsync(id);
        if (!sucesso)
            return NotFound(ApiResponse<object>.Erro("Consulta não encontrada."));

        return Ok(ApiResponse<object>.Ok("Consulta cancelada com sucesso."));
    }

    [HttpPut("{id}/inativar")]
    [Authorize(Roles = "SECRETARIA")]
    public async Task<IActionResult> Inativar(int id)
    {
        var sucesso = await _consultaService.InativarAsync(id);
        if (!sucesso)
            return NotFound(ApiResponse<object>.Erro("Consulta não encontrada."));

        return Ok(ApiResponse<object>.Ok("Consulta inativada com sucesso."));
    }
}
