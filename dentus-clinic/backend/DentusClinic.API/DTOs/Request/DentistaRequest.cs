using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class DentistaRequest
{
    [Required(ErrorMessage = "O campo Nome é obrigatório")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Nome deve ter entre 3 e 100 caracteres")]
    [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome não pode conter números ou caracteres especiais")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O campo CPF é obrigatório")]
    [CpfValido]
    public string Cpf { get; set; } = string.Empty;

    [Required(ErrorMessage = "O campo CRO é obrigatório")]
    [StringLength(20, MinimumLength = 4, ErrorMessage = "CRO deve ter entre 4 e 20 caracteres")]
    public string Cro { get; set; } = string.Empty;

    public string? Telefone { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Especialidade é obrigatória.")]
    public int IdEspecialidade { get; set; }

    [Required(ErrorMessage = "O campo E-mail é obrigatório")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [StringLength(150, ErrorMessage = "E-mail inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "O campo Senha é obrigatório")]
    [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres")]
    public string Senha { get; set; } = string.Empty;
}
