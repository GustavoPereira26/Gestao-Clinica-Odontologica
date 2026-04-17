using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Models;

public class Paciente : Usuario
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "O campo Email é obrigatório")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    [StringLength(150, ErrorMessage = "E-mail Inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "O Campo Telefone é obrigatório.")]
    [StringLength(100)]
    public string Endereco { get; set; }

    public ICollection<Consulta> Consultas { get; set; } = new List<Consulta>();
    public Prontuario? Prontuario { get; set; }
}
