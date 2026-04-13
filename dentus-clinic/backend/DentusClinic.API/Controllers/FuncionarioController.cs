using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Interfaces;
using DentusClinic.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentusClinic.API.Controllers;

[ApiController]
[Route("api/funcionarios")]
[Authorize]
public class FuncionarioController : ControllerBase
{
    private readonly IFuncionarioService _funcionarioService;

    public FuncionarioController(IFuncionarioService funcionarioService)
    {
        _funcionarioService = funcionarioService;
    }

    [HttpGet]
    public async Task<IActionResult> ListarTodos()
    {
        var funcionarios = await _funcionarioService.ListarTodosAsync();
        return Ok(ApiResponse<object>.Ok(funcionarios));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var funcionario = await _funcionarioService.BuscarPorIdAsync(id);
        if (funcionario is null)
            return NotFound(ApiResponse<object>.Erro("Funcionário não encontrado."));

        return Ok(ApiResponse<object>.Ok(funcionario));
    }

    [HttpPost]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Cadastrar([FromBody] FuncionarioRequest request)
    {
        var funcionario = await _funcionarioService.CadastrarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = funcionario.Id },
            ApiResponse<object>.Ok(funcionario, "Funcionário cadastrado com sucesso."));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Editar(int id, [FromBody] FuncionarioRequest request)
    {
        var funcionario = await _funcionarioService.EditarAsync(id, request);
        if (funcionario is null)
            return NotFound(ApiResponse<object>.Erro("Funcionário não encontrado."));

        return Ok(ApiResponse<object>.Ok(funcionario, "Funcionário atualizado com sucesso."));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Remover(int id)
    {
        var removido = await _funcionarioService.RemoverAsync(id);
        if (!removido)
            return NotFound(ApiResponse<object>.Erro("Funcionário não encontrado."));

        return Ok(ApiResponse<object>.Ok("Funcionário removido com sucesso."));
    }
}
