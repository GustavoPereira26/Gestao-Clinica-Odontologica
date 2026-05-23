using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class FuncionarioRequest
{
    [Required(ErrorMessage = "O campo Nome é obrigatório")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Nome deve ter entre 3 e 100 caracteres")]
    [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome não pode conter números ou caracteres especiais")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O campo CPF é obrigatório")]
    [CpfValido]
    public string Cpf { get; set; } = string.Empty;

    [DataPassada(ErrorMessage = "A data de nascimento não pode ser uma data futura ou o dia atual.")]
    public DateOnly DataNascimento { get; set; }

    public string? Telefone { get; set; }

    [Required(ErrorMessage = "O campo Cargo é obrigatório")]
    [RegularExpression(@"^(SECRETARIA|ADMINISTRADOR)$", ErrorMessage = "Cargo inválido. Valores aceitos: SECRETARIA, ADMINISTRADOR")]
    public string Cargo { get; set; } = string.Empty;

    [Required(ErrorMessage = "O campo E-mail é obrigatório")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [StringLength(150, ErrorMessage = "E-mail inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "O campo Senha é obrigatório")]
    [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres")]
    public string Senha { get; set; } = string.Empty;
}
