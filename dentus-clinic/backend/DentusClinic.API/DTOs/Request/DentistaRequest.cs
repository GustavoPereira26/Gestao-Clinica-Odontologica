namespace DentusClinic.API.DTOs.Request;

public class DentistaRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string Cro { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public int IdEspecialidade { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}
