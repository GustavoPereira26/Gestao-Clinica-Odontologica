using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Dentista : Usuario
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Cro { get; set; } = string.Empty;

    public int IdEspecialidade { get; set; }
    public Especialidade Especialidade { get; set; } = null!;

    public int IdAcesso { get; set; }

    public ICollection<Consulta> Consultas { get; set; } = new List<Consulta>();
}
