using System.ComponentModel.DataAnnotations;
using DentusClinic.API.Attributes;

namespace DentusClinic.API.DTOs.Request;

public class PacienteUpdateRequest
{
    [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome inválido. Não são permitidos números ou caracteres especiais.")]
    public string? Nome { get; set; }

    public string? Telefone { get; set; }

    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string? Email { get; set; }

    [DataValida("Data de nascimento inválida.")]
    [DataNaoFutura]
    public DateOnly? DataNascimento { get; set; }

    public string? Endereco { get; set; }
}
