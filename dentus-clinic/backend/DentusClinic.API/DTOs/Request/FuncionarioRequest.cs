using System.ComponentModel.DataAnnotations;
using DentusClinic.API.Attributes;

namespace DentusClinic.API.DTOs.Request;

public class FuncionarioRequest
{
    [Required(ErrorMessage = "Nome é obrigatório.")]
    [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome inválido. Não são permitidos números ou caracteres especiais.")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "CPF é obrigatório.")]
    [RegularExpression(@"^\d{11}$", ErrorMessage = "CPF inválido. Informe exatamente 11 dígitos numéricos.")]
    [CpfValido]
    public string Cpf { get; set; } = string.Empty;

    [DataValida("Data de nascimento inválida.")]
    [DataNaoFutura]
    public DateOnly DataNascimento { get; set; }

    public string? Telefone { get; set; }

    [Required(ErrorMessage = "Cargo é obrigatório.")]
    public string Cargo { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória.")]
    public string Senha { get; set; } = string.Empty;
}
