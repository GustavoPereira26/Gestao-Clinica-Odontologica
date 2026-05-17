using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.DTOs.Request;

public class ProntuarioRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Paciente é obrigatório.")]
    public int IdPaciente { get; set; }
}
