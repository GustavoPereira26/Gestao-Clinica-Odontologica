using System.ComponentModel.DataAnnotations;

namespace DentusClinic.API.Attributes;

public class CpfValidoAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string cpf || string.IsNullOrWhiteSpace(cpf))
            return ValidationResult.Success;

        if (cpf.Length != 11 || cpf.Distinct().Count() == 1)
            return new ValidationResult("CPF inválido.");

        var d = cpf.Select(c => c - '0').ToArray();

        int soma = 0;
        for (int i = 0; i < 9; i++) soma += d[i] * (10 - i);
        if (d[9] != (soma * 10 % 11) % 10) return new ValidationResult("CPF inválido.");

        soma = 0;
        for (int i = 0; i < 10; i++) soma += d[i] * (11 - i);
        if (d[10] != (soma * 10 % 11) % 10) return new ValidationResult("CPF inválido.");

        return ValidationResult.Success;
    }
}
