using DentusClinic.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Login
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O campo Email é obrigatório")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [StringLength(100, MinimumLength = 100, ErrorMessage = "E-mail Inválido")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(60)]
    public string Senha { get; set; } = string.Empty;

    [Required]
    public TiposAcessoEnum TipoAcesso { get; set; } 
    public Funcionario? Funcionario { get; set; }
    public Dentista? Dentista { get; set; }
}
