using System.ComponentModel.DataAnnotations;
using DentusClinic.API.Attributes;

namespace DentusClinic.API.DTOs.Request;

public class FuncionarioEditarRequest
{
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Nome deve ter entre 3 e 100 caracteres")]
    [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome não pode conter números ou caracteres especiais")]
    public string? Nome { get; set; }

    [DataValida("Data de nascimento inválida.")]
    [DataNaoFutura]
    public DateOnly? DataNascimento { get; set; }

    public string? Telefone { get; set; }

    [RegularExpression(@"^(SECRETARIA|ADMINISTRADOR)$", ErrorMessage = "Cargo inválido. Valores aceitos: SECRETARIA, ADMINISTRADOR")]
    public string? Cargo { get; set; }

    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [StringLength(150, ErrorMessage = "E-mail inválido")]
    public string? Email { get; set; }

    [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres")]
    public string? Senha { get; set; }
}
