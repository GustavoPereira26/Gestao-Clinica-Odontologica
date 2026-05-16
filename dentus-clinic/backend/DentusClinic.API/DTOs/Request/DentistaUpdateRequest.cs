using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class DentistaUpdateRequest
{
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Nome deve ter entre 3 e 100 caracteres")]
    [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome inválido. Não são permitidos números ou caracteres especiais.")]
    public string? Nome { get; set; }

    public string? Telefone { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Especialidade inválida.")]
    public int? IdEspecialidade { get; set; }

    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    [StringLength(150, ErrorMessage = "E-mail inválido")]
    public string? Email { get; set; }

    [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres.")]
    public string? Senha { get; set; }
}
