using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class DentistaUpdateRequest
{
    [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome inválido. Não são permitidos números ou caracteres especiais.")]
    public string? Nome { get; set; }

    public string? Telefone { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Especialidade inválida.")]
    public int? IdEspecialidade { get; set; }

    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string? Email { get; set; }

    public string? Senha { get; set; }
}
