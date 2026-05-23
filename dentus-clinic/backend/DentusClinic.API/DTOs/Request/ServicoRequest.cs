using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class ServicoRequest
{
    [Required(ErrorMessage = "Nome é obrigatório.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Nome deve ter entre 2 e 100 caracteres")]
    public string Nome { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Especialidade é obrigatória.")]
    public int IdEspecialidade { get; set; }
}
