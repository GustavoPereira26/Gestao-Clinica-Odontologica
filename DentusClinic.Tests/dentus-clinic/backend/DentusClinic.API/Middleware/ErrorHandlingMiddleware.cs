using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _proximo;
    private readonly ILogger<ErrorHandlingMiddleware> _registrador;

    public ErrorHandlingMiddleware(RequestDelegate proximo, ILogger<ErrorHandlingMiddleware> registrador)
    {
        _proximo = proximo;
        _registrador = registrador;
    }

    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await _proximo(contexto);
        }
        catch (InvalidOperationException ex)
        {
            await EscreverResposta(contexto, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (DbUpdateException ex)
        {
            var mensagem = ObterMensagemBancoDados(ex);
            await EscreverResposta(contexto, HttpStatusCode.BadRequest, mensagem);
        }
        catch (Exception ex)
        {
            _registrador.LogError(ex, "Erro inesperado: {Message}", ex.Message);
            await EscreverResposta(contexto, HttpStatusCode.InternalServerError,
                "Ocorreu um erro interno no servidor.");
        }
    }

    private static string ObterMensagemBancoDados(DbUpdateException ex)
    {
        var mensagemInterna = ex.InnerException?.Message ?? string.Empty;

        if (mensagemInterna.Contains("UNIQUE") || mensagemInterna.Contains("unique") ||
            mensagemInterna.Contains("duplicate") || mensagemInterna.Contains("IX_"))
            return "Já existe um registro com esses dados. Verifique os campos únicos (CPF, CRO, e-mail).";

        if (mensagemInterna.Contains("FOREIGN KEY") || mensagemInterna.Contains("foreign key"))
            return "Referência inválida. Verifique se os dados relacionados existem.";

        if (mensagemInterna.Contains("NOT NULL") || mensagemInterna.Contains("not null") ||
            mensagemInterna.Contains("cannot be null"))
            return "Campo obrigatório não informado.";

        return "Erro ao salvar os dados. Verifique os campos informados.";
    }

    private static async Task EscreverResposta(HttpContext contexto, HttpStatusCode codigoStatus, string mensagem)
    {
        contexto.Response.ContentType = "application/json";
        contexto.Response.StatusCode = (int)codigoStatus;

        var resposta = new { error = new[] { mensagem } };
        var json = JsonSerializer.Serialize(resposta, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await contexto.Response.WriteAsync(json);
    }
}
