using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

public class CpfValidoAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string cpf)
            return new ValidationResult("CPF inválido.");

        var digits = Regex.Replace(cpf, @"\D", "");

        if (digits.Length != 11)
            return new ValidationResult("CPF deve conter 11 dígitos.");

        if (digits.Distinct().Count() == 1)
            return new ValidationResult("CPF inválido.");

        if (!ValidarDigito(digits, 9) || !ValidarDigito(digits, 10))
            return new ValidationResult("CPF inválido.");

        return ValidationResult.Success;
    }

    private static bool ValidarDigito(string digits, int position)
    {
        int sum = 0;
        for (int i = 0; i < position; i++)
            sum += int.Parse(digits[i].ToString()) * (position + 1 - i);

        int remainder = sum % 11;
        int expected = remainder < 2 ? 0 : 11 - remainder;

        return int.Parse(digits[position].ToString()) == expected;
    }
}
