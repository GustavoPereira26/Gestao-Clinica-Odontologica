using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Atendimento
{
    public int Id { get; set; }

    public int IdConsulta { get; set; }
    public Consulta Consulta { get; set; } = null!;

    public string? Descricao { get; set; }
    public string? ProcedimentoRealizado { get; set; }

    [Required]
    public DateOnly DataAtendimento { get; set; }

    public string? Observacao { get; set; }
}
