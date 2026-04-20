using System.ComponentModel.DataAnnotations;
using DentusClinic.API.Attributes;

namespace DentusClinic.API.DTOs.Request;

public class ConsultaRequest
{
    [DataValida("Data da consulta inválida.")]
    public DateOnly DataConsulta { get; set; }

    [HoraValida("Horário da consulta inválido.")]
    public TimeOnly HoraConsulta { get; set; }

    public bool Retorno { get; set; } = false;

    [Range(1, int.MaxValue, ErrorMessage = "Dentista é obrigatório.")]
    public int IdDentista { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Paciente é obrigatório.")]
    public int IdPaciente { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Serviço é obrigatório.")]
    public int IdServico { get; set; }
}
