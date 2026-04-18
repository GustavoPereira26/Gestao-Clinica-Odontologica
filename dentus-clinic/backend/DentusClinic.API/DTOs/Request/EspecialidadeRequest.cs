using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class EspecialidadeRequest
{
    [Required(ErrorMessage = "Nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;
}
