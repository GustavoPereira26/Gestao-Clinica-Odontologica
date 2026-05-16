using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class EspecialidadeRequest
{
    [Required(ErrorMessage = "Nome é obrigatório.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Nome deve ter entre 2 e 100 caracteres")]
    public string Nome { get; set; } = string.Empty;
}
