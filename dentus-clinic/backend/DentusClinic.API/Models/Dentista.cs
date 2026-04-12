using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Dentista
{
    public int Id { get; set; }

    [Required]
    public string Nome { get; set; } = string.Empty;

    [Required]
    public string Cpf { get; set; } = string.Empty;

    [Required]
    public string Cro { get; set; } = string.Empty;

    public string? Telefone { get; set; }

    public int IdEspecialidade { get; set; }
    public Especialidade Especialidade { get; set; } = null!;

    public int IdAcesso { get; set; }
    public Login Login { get; set; } = null!;

    public ICollection<Consulta> Consultas { get; set; } = new List<Consulta>();
}
