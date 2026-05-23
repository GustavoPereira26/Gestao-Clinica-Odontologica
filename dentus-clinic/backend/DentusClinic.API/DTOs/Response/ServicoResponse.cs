namespace DentusClinic.API.DTOs.Response;

public class ServicoResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int? IdEspecialidade { get; set; }
}
