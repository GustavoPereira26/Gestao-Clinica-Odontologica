using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DentusClinic.API.Models;

public class Funcionario : Usuario
{
    [Key]
    public int Id { get; set; }

    [Required]
    [CargoPermitido]
    public string Cargo { get; set; } = string.Empty;

    [ForeignKey(nameof(Login))]
    public int IdAcesso { get; set; }
}
