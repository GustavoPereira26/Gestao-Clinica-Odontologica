namespace DentusClinic.API.DTOs.Response;

public class AtendimentoResponse
{
    public int Id { get; set; }
    public int IdConsulta { get; set; }
    public string? Descricao { get; set; }
    public string? ProcedimentoRealizado { get; set; }
    public DateOnly DataAtendimento { get; set; }
    public string? Observacao { get; set; }
}
