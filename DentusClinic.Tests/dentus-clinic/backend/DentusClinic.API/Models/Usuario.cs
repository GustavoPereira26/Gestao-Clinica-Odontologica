using DentusClinic.API.Enums;
using FluentValidation.Validators;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DentusClinic.API.Models {
    [NotMapped]
    public abstract class Usuario {

        [Required(ErrorMessage = "O campo Nome é obrigatório")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Nome inválido")]
        [RegularExpression(@"^[\p{L} ]+$", ErrorMessage = "Nome inválido")]
        public String Nome { get; set; } = String.Empty;

        [Required(ErrorMessage = "O campo CPF é obrigatório")]
        [StringLength(11, MinimumLength = 11, ErrorMessage = "CPF Inválido")]
        public String Cpf { get; set; } = String.Empty;

        [Required(ErrorMessage = "O campo Telefone é obrigatório")]
        [Phone(ErrorMessage = "Telefone inválido")]
        public String Telefone { get; set; } = String.Empty;

        [Required(ErrorMessage = "O campo data de nascimento é obrigatório.")]
        [DataType(DataType.Date)]
        public DateOnly DataNascimento { get; set; }

        public virtual Login Login { get; set; } = null!;


    }
}


