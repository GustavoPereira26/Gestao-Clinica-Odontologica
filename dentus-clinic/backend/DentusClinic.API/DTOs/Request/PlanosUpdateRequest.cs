using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class PlanosUpdateRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Serviço inválido.")]
    public int? IdServico { get; set; }

    public string? Descricao { get; set; }

    public string? Condicao { get; set; }

    public string? Status { get; set; }

    public string? Observacao { get; set; }
}
