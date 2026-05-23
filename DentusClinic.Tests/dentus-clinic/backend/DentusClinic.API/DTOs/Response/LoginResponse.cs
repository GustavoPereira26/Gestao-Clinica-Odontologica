namespace DentusClinic.API.DTOs.Response;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string TipoAcesso { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public DateTime Expiracao { get; set; }
}
