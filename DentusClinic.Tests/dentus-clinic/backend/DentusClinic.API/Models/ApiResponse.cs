using System.Text.Json.Serialization;

namespace DentusClinic.API.Models;

public class ApiResponse<T>
{
    public bool Sucesso { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Mensagem { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public T? Dados { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<string>? Erros { get; set; }

    public static ApiResponse<T> Ok(T? dados, string mensagem = "Operação realizada com sucesso.")
        => new() { Sucesso = true, Mensagem = mensagem, Dados = dados };

    public static ApiResponse<T> Ok(string mensagem)
        => new() { Sucesso = true, Mensagem = mensagem };

    public static ApiResponse<T> Erro(string mensagem)
        => new() { Sucesso = false, Mensagem = mensagem };

    public static ApiResponse<T> ErroValidacao(List<string> erros)
        => new() { Sucesso = false, Erros = erros };
}
