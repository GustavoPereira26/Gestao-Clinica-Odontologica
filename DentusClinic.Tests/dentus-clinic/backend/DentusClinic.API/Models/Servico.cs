using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Servico
{
    public int Id { get; set; }

    [Required]
    public string Nome { get; set; } = string.Empty;

    public ICollection<Planos> Planos { get; set; } = new List<Planos>();
}
