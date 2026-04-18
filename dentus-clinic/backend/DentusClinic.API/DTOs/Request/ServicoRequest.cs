using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class ServicoRequest
{
    [Required(ErrorMessage = "Nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;
}
