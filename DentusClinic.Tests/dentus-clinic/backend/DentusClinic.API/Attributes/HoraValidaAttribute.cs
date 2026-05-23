using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Attributes;

public class HoraValidaAttribute(string mensagemErro) : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is TimeOnly hora && hora == TimeOnly.MinValue)
            return new ValidationResult(mensagemErro);
        return ValidationResult.Success;
    }
}
