using System.ComponentModel.DataAnnotations;
using DentusClinic.API.Attributes;

namespace DentusClinic.API.DTOs.Request;

public class PacienteRequest
{
    [Required(ErrorMessage = "Nome é obrigatório.")]
    [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome inválido. Não são permitidos números ou caracteres especiais.")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "CPF é obrigatório.")]
    [RegularExpression(@"^\d{11}$", ErrorMessage = "CPF inválido. Informe exatamente 11 dígitos numéricos.")]
    [CpfValido]
    public string Cpf { get; set; } = string.Empty;

    [Required(ErrorMessage = "Telefone é obrigatório.")]
    public string Telefone { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string Email { get; set; } = string.Empty;

    [DataValida("Data de nascimento inválida.")]
    [DataNaoFutura]
    public DateOnly DataNascimento { get; set; }

    [Required(ErrorMessage = "Endereço é obrigatório.")]
    public string Endereco { get; set; } = string.Empty;
}
