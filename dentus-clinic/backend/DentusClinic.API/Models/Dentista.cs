using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DentusClinic.API.Models;

public class Dentista : Usuario
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Cro { get; set; } = string.Empty;

    public int IdEspecialidade { get; set; }
    public Especialidade Especialidade { get; set; } = null!;

    [ForeignKey(nameof(Login))]
    public int IdAcesso { get; set; }
    public Login Login { get; set; } = null!;

    public ICollection<Consulta> Consultas { get; set; } = new List<Consulta>();
}
