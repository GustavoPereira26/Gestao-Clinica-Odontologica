namespace DentusClinic.API.DTOs.Response;

public class PacienteResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateOnly DataNascimento { get; set; }
    public string Endereco { get; set; } = string.Empty;
    public bool Ativo { get; set; }
}
