namespace DentusClinic.API.DTOs.Request;

public class ConsultaRequest
{
    public DateOnly DataConsulta { get; set; }
    public TimeOnly HoraConsulta { get; set; }
    public bool Retorno { get; set; } = false;
    public int IdDentista { get; set; }
    public int IdPaciente { get; set; }
}
