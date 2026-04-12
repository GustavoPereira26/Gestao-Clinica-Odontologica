namespace DentusClinic.API.DTOs.Request;

public class PacienteRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public DateOnly DataNascimento { get; set; }
    public string? Endereco { get; set; }
}
