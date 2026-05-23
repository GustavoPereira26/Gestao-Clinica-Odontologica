using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Attributes;

public class DataValidaAttribute(string mensagemErro) : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is DateOnly data && data == DateOnly.MinValue)
            return new ValidationResult(mensagemErro);

        return ValidationResult.Success;
    }
}
