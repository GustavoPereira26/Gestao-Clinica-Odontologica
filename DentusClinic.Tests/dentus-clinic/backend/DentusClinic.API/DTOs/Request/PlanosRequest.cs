using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class PlanosRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Prontuário é obrigatório.")]
    public int IdProntuario { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Serviço é obrigatório.")]
    public int IdServico { get; set; }

    public string? Descricao { get; set; }
    public string? Condicao { get; set; }

    [Required(ErrorMessage = "Status é obrigatório.")]
    public string Status { get; set; } = "Ativo";

    public string? Observacao { get; set; }
}
