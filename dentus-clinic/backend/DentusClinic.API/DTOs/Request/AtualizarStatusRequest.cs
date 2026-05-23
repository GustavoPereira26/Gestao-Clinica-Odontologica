using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class AtualizarStatusRequest
{
    [Required(ErrorMessage = "O campo Status é obrigatório")]
    [StringLength(50, ErrorMessage = "Status inválido")]
    public string Status { get; set; } = string.Empty;
}
