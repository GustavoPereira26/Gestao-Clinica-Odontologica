namespace DentusClinic.API.DTOs.Response;

public class FuncionarioResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public DateOnly DataNascimento { get; set; }
    public string? Telefone { get; set; }
    public string Cargo { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
