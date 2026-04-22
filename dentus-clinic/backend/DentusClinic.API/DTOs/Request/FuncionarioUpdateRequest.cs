using System.ComponentModel.DataAnnotations;
using DentusClinic.API.Attributes;

namespace DentusClinic.API.DTOs.Request;

public class FuncionarioUpdateRequest
{
    [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome inválido. Não são permitidos números ou caracteres especiais.")]
    public string? Nome { get; set; }

    [DataValida("Data de nascimento inválida.")]
    [DataNaoFutura]
    public DateOnly? DataNascimento { get; set; }

    public string? Telefone { get; set; }

    public string? Cargo { get; set; }

    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string? Email { get; set; }

    public string? Senha { get; set; }
}
