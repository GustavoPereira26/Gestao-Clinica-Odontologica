using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Especialidade
{
    public int Id { get; set; }

    [Required]
    public string Nome { get; set; } = string.Empty;

    public ICollection<Dentista> Dentistas { get; set; } = new List<Dentista>();
}
