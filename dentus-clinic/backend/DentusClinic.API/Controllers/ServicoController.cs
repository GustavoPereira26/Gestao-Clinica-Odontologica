using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentusClinic.API.Controllers;

[ApiController]
[Route("api/servicos")]
[Authorize]
public class ServicoController : ControllerBase
{
    private readonly IServicoService _servicoService;

    public ServicoController(IServicoService servicoService)
    {
        _servicoService = servicoService;
    }

    [HttpGet]
    public async Task<IActionResult> ListarTodos()
    {
        var servicos = await _servicoService.ListarTodosAsync();
        return Ok(ApiResponse<object>.Ok(servicos));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var servico = await _servicoService.BuscarPorIdAsync(id);
        if (servico is null)
            return NotFound(ApiResponse<object>.Erro("Serviço não encontrado."));

        return Ok(ApiResponse<object>.Ok(servico));
    }

    [HttpPost]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Cadastrar([FromBody] ServicoRequest request)
    {
        var servico = await _servicoService.CadastrarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = servico.Id },
            ApiResponse<object>.Ok(servico, "Serviço cadastrado com sucesso."));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Editar(int id, [FromBody] ServicoRequest request)
    {
        var servico = await _servicoService.EditarAsync(id, request);
        if (servico is null)
            return NotFound(ApiResponse<object>.Erro("Serviço não encontrado."));

        return Ok(ApiResponse<object>.Ok(servico, "Serviço atualizado com sucesso."));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Remover(int id)
    {
        var removido = await _servicoService.RemoverAsync(id);
        if (!removido)
            return NotFound(ApiResponse<object>.Erro("Serviço não encontrado."));

        return Ok(ApiResponse<object>.Ok("Serviço removido com sucesso."));
    }
}
