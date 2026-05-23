using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class PacienteRequest
{
    [Required(ErrorMessage = "O campo Nome é obrigatório")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Nome deve ter entre 3 e 100 caracteres")]
    [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome não pode conter números ou caracteres especiais")]
    public string Nome { get; set; } = string.Empty;
    [Required(ErrorMessage = "O campo CPF é obrigatório")]
    [CpfValido]
    public string Cpf { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    [Required(ErrorMessage = "O campo Email é obrigatório")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [StringLength(150, ErrorMessage = "E-mail inválido")]
    public string Email { get; set; } = string.Empty;
    [DataPassada(ErrorMessage = "A data de nascimento não pode ser uma data futura ou o dia atual.")]
    public DateOnly DataNascimento { get; set; }
    public string? Endereco { get; set; }
}
