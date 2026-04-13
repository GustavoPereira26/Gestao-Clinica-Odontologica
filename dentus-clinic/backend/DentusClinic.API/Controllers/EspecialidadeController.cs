using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentusClinic.API.Controllers;

[ApiController]
[Route("api/especialidades")]
[Authorize]
public class EspecialidadeController : ControllerBase
{
    private readonly IEspecialidadeService _especialidadeService;

    public EspecialidadeController(IEspecialidadeService especialidadeService)
    {
        _especialidadeService = especialidadeService;
    }

    [HttpGet]
    public async Task<IActionResult> ListarTodos()
    {
        var especialidades = await _especialidadeService.ListarTodosAsync();
        return Ok(ApiResponse<object>.Ok(especialidades));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var esp = await _especialidadeService.BuscarPorIdAsync(id);
        if (esp is null)
            return NotFound(ApiResponse<object>.Erro("Especialidade não encontrada."));

        return Ok(ApiResponse<object>.Ok(esp));
    }

    [HttpPost]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Cadastrar([FromBody] EspecialidadeRequest request)
    {
        var esp = await _especialidadeService.CadastrarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = esp.Id },
            ApiResponse<object>.Ok(esp, "Especialidade cadastrada com sucesso."));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Editar(int id, [FromBody] EspecialidadeRequest request)
    {
        var esp = await _especialidadeService.EditarAsync(id, request);
        if (esp is null)
            return NotFound(ApiResponse<object>.Erro("Especialidade não encontrada."));

        return Ok(ApiResponse<object>.Ok(esp, "Especialidade atualizada com sucesso."));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Remover(int id)
    {
        var removido = await _especialidadeService.RemoverAsync(id);
        if (!removido)
            return NotFound(ApiResponse<object>.Erro("Especialidade não encontrada."));

        return Ok(ApiResponse<object>.Ok("Especialidade removida com sucesso."));
    }
}
