namespace DentusClinic.API.DTOs.Request;

public class AtendimentoRequest
{
    public int IdConsulta { get; set; }
    public string? Descricao { get; set; }
    public string? ProcedimentoRealizado { get; set; }
    public DateOnly DataAtendimento { get; set; }
    public string? Observacao { get; set; }
}
