using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentusClinic.API.Controllers;

[ApiController]
[Route("api/planos")]
[Authorize]
public class PlanosController : ControllerBase
{
    private readonly IPlanosService _planosService;

    public PlanosController(IPlanosService planosService)
    {
        _planosService = planosService;
    }

    [HttpGet]
    public async Task<IActionResult> ListarTodos()
    {
        var planos = await _planosService.ListarTodosAsync();
        return Ok(ApiResponse<object>.Ok(planos));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var plano = await _planosService.BuscarPorIdAsync(id);
        if (plano is null)
            return NotFound(ApiResponse<object>.Erro("Plano não encontrado."));

        return Ok(ApiResponse<object>.Ok(plano));
    }

    [HttpPost]
    public async Task<IActionResult> Cadastrar([FromBody] PlanosRequest request)
    {
        var plano = await _planosService.CadastrarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = plano.Id },
            ApiResponse<object>.Ok(plano, "Plano cadastrado com sucesso."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, [FromBody] PlanosRequest request)
    {
        var plano = await _planosService.EditarAsync(id, request);
        if (plano is null)
            return NotFound(ApiResponse<object>.Erro("Plano não encontrado."));

        return Ok(ApiResponse<object>.Ok(plano, "Plano atualizado com sucesso."));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADM")]
    public async Task<IActionResult> Remover(int id)
    {
        var removido = await _planosService.RemoverAsync(id);
        if (!removido)
            return NotFound(ApiResponse<object>.Erro("Plano não encontrado."));

        return Ok(ApiResponse<object>.Ok("Plano removido com sucesso."));
    }
}
