namespace DentusClinic.API.DTOs.Response;

public class ProntuarioResponse
{
    public int Id { get; set; }
    public int IdPaciente { get; set; }
    public string NomePaciente { get; set; } = string.Empty;
    public DateOnly DataAbertura { get; set; }
}
