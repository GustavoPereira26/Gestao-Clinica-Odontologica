using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Paciente
{
    public int Id { get; set; }

    [Required]
    public string Nome { get; set; } = string.Empty;

    [Required]
    public string Cpf { get; set; } = string.Empty;

    [Required]
    public string Telefone { get; set; } = string.Empty;

    [Required]
    public string Email { get; set; } = string.Empty;

    public DateOnly DataNascimento { get; set; }

    [Required]
    public string Endereco { get; set; } = string.Empty;

    public ICollection<Consulta> Consultas { get; set; } = new List<Consulta>();
    public Prontuario? Prontuario { get; set; }
}
