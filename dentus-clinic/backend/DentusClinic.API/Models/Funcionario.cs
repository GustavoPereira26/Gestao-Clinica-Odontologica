using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Funcionario : Usuario
{
    [Key]
    public int Id { get; set; }


    [Required]
    [CargoPermitido]
    public string Cargo { get; set; } = string.Empty; 

    public int IdAcesso { get; set; }
    public Login Login { get; set; } = null!;
}
