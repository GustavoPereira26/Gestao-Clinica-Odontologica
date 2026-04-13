namespace DentusClinic.API.Models;

public class ApiResponse<T>
{
    public bool Sucesso { get; set; }
    public string Mensagem { get; set; } = string.Empty;
    public T? Dados { get; set; }

    public static ApiResponse<T> Ok(T? dados, string mensagem = "Operação realizada com sucesso.")
        => new() { Sucesso = true, Mensagem = mensagem, Dados = dados };

    public static ApiResponse<T> Ok(string mensagem)
        => new() { Sucesso = true, Mensagem = mensagem, Dados = default };

    public static ApiResponse<T> Erro(string mensagem)
        => new() { Sucesso = false, Mensagem = mensagem, Dados = default };
}
