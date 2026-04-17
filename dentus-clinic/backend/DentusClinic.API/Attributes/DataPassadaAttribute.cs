using System.ComponentModel.DataAnnotations;

public class DataPassadaAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is null)
            return ValidationResult.Success;

        if (value is not DateOnly data)
            return new ValidationResult("Data inválida.");

        if (data >= DateOnly.FromDateTime(DateTime.Today))
            return new ValidationResult(ErrorMessage ?? "A data de nascimento não pode ser uma data futura ou o dia atual.");

        return ValidationResult.Success;
    }
}
