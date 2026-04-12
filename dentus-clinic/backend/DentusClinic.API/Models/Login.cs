using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Login
{
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Senha { get; set; } = string.Empty;

    [Required]
    public string TipoAcesso { get; set; } = string.Empty; // "ADM", "Dentista", "Secretaria"

    public Funcionario? Funcionario { get; set; }
    public Dentista? Dentista { get; set; }
}
