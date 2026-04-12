namespace DentusClinic.API.DTOs.Request;

public class PlanosRequest
{
    public int IdProntuario { get; set; }
    public int IdServico { get; set; }
    public string? Descricao { get; set; }
    public string? Condicao { get; set; }
    public string Status { get; set; } = "Ativo";
    public string? Observacao { get; set; }
}
