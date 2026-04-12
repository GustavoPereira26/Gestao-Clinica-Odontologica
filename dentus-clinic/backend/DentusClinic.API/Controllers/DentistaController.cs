using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentusClinic.API.Controllers;

[ApiController]
[Route("api/dentistas")]
[Authorize]
public class DentistaController : ControllerBase
{
    private readonly IDentistaService _dentistaService;

    public DentistaController(IDentistaService dentistaService)
    {
        _dentistaService = dentistaService;
    }

    [HttpGet]
    public async Task<IActionResult> ListarTodos()
    {
        var dentistas = await _dentistaService.ListarTodosAsync();
        return Ok(ApiResponse<object>.Ok(dentistas));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var dentista = await _dentistaService.BuscarPorIdAsync(id);
        if (dentista is null)
            return NotFound(ApiResponse<object>.Erro("Dentista não encontrado."));

        return Ok(ApiResponse<object>.Ok(dentista));
    }

    [HttpPost]
    [Authorize(Roles = "ADM")]
    public async Task<IActionResult> Cadastrar([FromBody] DentistaRequest request)
    {
        var dentista = await _dentistaService.CadastrarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = dentista.Id },
            ApiResponse<object>.Ok(dentista, "Dentista cadastrado com sucesso."));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADM")]
    public async Task<IActionResult> Editar(int id, [FromBody] DentistaRequest request)
    {
        var dentista = await _dentistaService.EditarAsync(id, request);
        if (dentista is null)
            return NotFound(ApiResponse<object>.Erro("Dentista não encontrado."));

        return Ok(ApiResponse<object>.Ok(dentista, "Dentista atualizado com sucesso."));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADM")]
    public async Task<IActionResult> Remover(int id)
    {
        var removido = await _dentistaService.RemoverAsync(id);
        if (!removido)
            return NotFound(ApiResponse<object>.Erro("Dentista não encontrado."));

        return Ok(ApiResponse<object>.Ok(null, "Dentista removido com sucesso."));
    }
}
