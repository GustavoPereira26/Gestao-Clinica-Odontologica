using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Consulta
{
    public int Id { get; set; }

    [Required]
    public DateOnly DataConsulta { get; set; }

    [Required]
    public TimeOnly HoraConsulta { get; set; }

    public bool Retorno { get; set; } = false;

    [Required]
    public string Status { get; set; } = "Agendada"; // "Agendada", "Aguardando", "EmAtendimento", "Concluida", "Cancelada"

    public int IdDentista { get; set; }
    public Dentista Dentista { get; set; } = null!;

    public int IdPaciente { get; set; }
    public Paciente Paciente { get; set; } = null!;

    public int? IdServico { get; set; }
    public Servico? Servico { get; set; }

    public Atendimento? Atendimento { get; set; }
}
