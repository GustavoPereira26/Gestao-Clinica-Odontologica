using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentusClinic.API.Controllers;

[ApiController]
[Route("api/atendimentos")]
[Authorize]
public class AtendimentoController : ControllerBase
{
    private readonly IAtendimentoService _atendimentoService;

    public AtendimentoController(IAtendimentoService atendimentoService)
    {
        _atendimentoService = atendimentoService;
    }

    [HttpGet]
    public async Task<IActionResult> ListarTodos()
    {
        var atendimentos = await _atendimentoService.ListarTodosAsync();
        return Ok(ApiResponse<object>.Ok(atendimentos));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var atendimento = await _atendimentoService.BuscarPorIdAsync(id);
        if (atendimento is null)
            return NotFound(ApiResponse<object>.Erro("Atendimento não encontrado."));

        return Ok(ApiResponse<object>.Ok(atendimento));
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] AtendimentoRequest request)
    {
        try
        {
            var atendimento = await _atendimentoService.RegistrarAsync(request);
            return CreatedAtAction(nameof(BuscarPorId), new { id = atendimento.Id },
                ApiResponse<object>.Ok(atendimento, "Atendimento registrado com sucesso."));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Erro(ex.Message));
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, [FromBody] AtendimentoRequest request)
    {
        var atendimento = await _atendimentoService.EditarAsync(id, request);
        if (atendimento is null)
            return NotFound(ApiResponse<object>.Erro("Atendimento não encontrado."));

        return Ok(ApiResponse<object>.Ok(atendimento, "Atendimento atualizado com sucesso."));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Remover(int id)
    {
        var removido = await _atendimentoService.RemoverAsync(id);
        if (!removido)
            return NotFound(ApiResponse<object>.Erro("Atendimento não encontrado."));

        return Ok(ApiResponse<object>.Ok("Atendimento removido com sucesso."));
    }
}
