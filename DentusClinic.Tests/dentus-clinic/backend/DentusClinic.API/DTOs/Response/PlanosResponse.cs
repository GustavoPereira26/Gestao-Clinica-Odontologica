namespace DentusClinic.API.DTOs.Response;

public class PlanosResponse
{
    public int Id { get; set; }
    public int IdProntuario { get; set; }
    public int IdServico { get; set; }
    public string NomeServico { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string? Condicao { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Observacao { get; set; }
}
