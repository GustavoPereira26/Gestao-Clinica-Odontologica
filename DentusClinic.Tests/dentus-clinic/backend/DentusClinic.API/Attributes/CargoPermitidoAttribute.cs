using DentusClinic.API.Enums;
using System.ComponentModel.DataAnnotations;

public class CargoPermitidoAttribute : ValidationAttribute {
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext) {
        if (value is TiposAcessoEnum cargo) {
            if (cargo == TiposAcessoEnum.SECRETARIA || cargo == TiposAcessoEnum.ADMINISTRADOR) {
                return ValidationResult.Success;
            }
        }
        return new ValidationResult("Cargo não permitido para funcionários.");
    }
}