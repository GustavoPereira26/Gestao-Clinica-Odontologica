using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class ServicoRequest
{
    [Required(ErrorMessage = "Nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Especialidade é obrigatória.")]
    public int IdEspecialidade { get; set; }
}
