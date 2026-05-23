namespace DentusClinic.API.Models;

public class Prontuario
{
    public int Id { get; set; }

    public int IdPaciente { get; set; }
    public Paciente Paciente { get; set; } = null!;

    public DateOnly DataAbertura { get; set; } = DateOnly.FromDateTime(DateTime.Today);

    public ICollection<Planos> Planos { get; set; } = new List<Planos>();
}
