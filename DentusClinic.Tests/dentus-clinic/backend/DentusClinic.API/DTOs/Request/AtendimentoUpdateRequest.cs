using DentusClinic.API.Attributes;

namespace DentusClinic.API.DTOs.Request;

public class AtendimentoUpdateRequest
{
    public string? Descricao { get; set; }

    public string? ProcedimentoRealizado { get; set; }

    [DataValida("Data do atendimento inválida.")]
    public DateOnly? DataAtendimento { get; set; }

    public string? Observacao { get; set; }
}
