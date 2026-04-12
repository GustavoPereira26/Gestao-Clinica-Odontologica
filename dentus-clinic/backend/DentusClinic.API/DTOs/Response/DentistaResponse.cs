namespace DentusClinic.API.DTOs.Response;

public class DentistaResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string Cro { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public int IdEspecialidade { get; set; }
    public string NomeEspecialidade { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
