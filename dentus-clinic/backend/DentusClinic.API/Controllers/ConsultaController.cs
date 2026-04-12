using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
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
    public async Task<IActionResult> ListarTodos()
    {
        var consultas = await _consultaService.ListarTodosAsync();
        return Ok(ApiResponse<object>.Ok(consultas));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var consulta = await _consultaService.BuscarPorIdAsync(id);
        if (consulta is null)
            return NotFound(ApiResponse<object>.Erro("Consulta não encontrada."));

        return Ok(ApiResponse<object>.Ok(consulta));
    }

    [HttpPost]
    public async Task<IActionResult> Agendar([FromBody] ConsultaRequest request)
    {
        var consulta = await _consultaService.AgendarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = consulta.Id },
            ApiResponse<object>.Ok(consulta, "Consulta agendada com sucesso."));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADM,Secretaria")]
    public async Task<IActionResult> Editar(int id, [FromBody] ConsultaRequest request)
    {
        var consulta = await _consultaService.EditarAsync(id, request);
        if (consulta is null)
            return NotFound(ApiResponse<object>.Erro("Consulta não encontrada."));

        return Ok(ApiResponse<object>.Ok(consulta, "Consulta atualizada com sucesso."));
    }

    [HttpPut("{id}/chegada")]
    public async Task<IActionResult> RegistrarChegada(int id)
    {
        var sucesso = await _consultaService.RegistrarChegadaAsync(id);
        if (!sucesso)
            return NotFound(ApiResponse<object>.Erro("Consulta não encontrada."));

        return Ok(ApiResponse<object>.Ok(null, "Chegada do paciente registrada."));
    }

    [HttpPut("{id}/cancelar")]
    [Authorize(Roles = "ADM,Secretaria")]
    public async Task<IActionResult> Cancelar(int id)
    {
        var sucesso = await _consultaService.CancelarAsync(id);
        if (!sucesso)
            return NotFound(ApiResponse<object>.Erro("Consulta não encontrada."));

        return Ok(ApiResponse<object>.Ok(null, "Consulta cancelada com sucesso."));
    }
}
