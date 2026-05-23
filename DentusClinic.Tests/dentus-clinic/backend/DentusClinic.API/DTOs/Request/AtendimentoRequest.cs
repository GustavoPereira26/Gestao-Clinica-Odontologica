using System.ComponentModel.DataAnnotations;
using DentusClinic.API.Attributes;

namespace DentusClinic.API.DTOs.Request;

public class AtendimentoRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Consulta é obrigatória.")]
    public int IdConsulta { get; set; }

    public string? Descricao { get; set; }

    public string? ProcedimentoRealizado { get; set; }

    [DataValida("Data do atendimento inválida.")]
    public DateOnly DataAtendimento { get; set; }

    public string? Observacao { get; set; }
}
