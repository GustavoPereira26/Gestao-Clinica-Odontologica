namespace DentusClinic.API.Models;

public class Planos
{
    public int Id { get; set; }

    public int IdProntuario { get; set; }
    public Prontuario Prontuario { get; set; } = null!;

    public int? IdServico { get; set; }
    public Servico? Servico { get; set; }

    public string? Descricao { get; set; }
    public string? Condicao { get; set; }

    public string Status { get; set; } = "Ativo"; // "Ativo", "Concluido", "Cancelado"

    public string? Observacao { get; set; }

    public string? Dente { get; set; }

    public DateOnly DataCriacao { get; set; } = DateOnly.FromDateTime(DateTime.Today);

    public DateOnly? DataAtualizacao { get; set; }
}
