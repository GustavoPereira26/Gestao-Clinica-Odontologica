using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Funcionario
{
    public int Id { get; set; }

    [Required]
    public string Nome { get; set; } = string.Empty;

    [Required]
    public string Cpf { get; set; } = string.Empty;

    public DateOnly DataNascimento { get; set; }

    public string? Telefone { get; set; }

    [Required]
    public string Cargo { get; set; } = string.Empty; // "Secretaria" ou "ADM"

    public int IdAcesso { get; set; }
    public Login Login { get; set; } = null!;
}
