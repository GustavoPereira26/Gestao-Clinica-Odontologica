using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class FuncionarioEditarRequest
{
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Nome deve ter entre 3 e 100 caracteres")]
    [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome não pode conter números ou caracteres especiais")]
    public string? Nome { get; set; }
    public DateOnly? DataNascimento { get; set; }
    public string? Telefone { get; set; }
    public string? Cargo { get; set; }
    public string? Email { get; set; }
    public string? Senha { get; set; }
}
