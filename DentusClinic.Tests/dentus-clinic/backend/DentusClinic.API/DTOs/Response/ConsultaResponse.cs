namespace DentusClinic.API.DTOs.Response;

public class ConsultaResponse
{
    public int Id { get; set; }
    public DateOnly DataConsulta { get; set; }
    public TimeOnly HoraConsulta { get; set; }
    public bool Retorno { get; set; }
    public string Status { get; set; } = string.Empty;
    public string NomeDentista { get; set; } = string.Empty;
    public string NomePaciente { get; set; } = string.Empty;
    public string NomeServico { get; set; } = string.Empty;
}
