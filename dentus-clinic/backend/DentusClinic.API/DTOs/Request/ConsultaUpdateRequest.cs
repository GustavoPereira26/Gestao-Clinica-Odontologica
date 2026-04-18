using System.ComponentModel.DataAnnotations;
using DentusClinic.API.Attributes;

namespace DentusClinic.API.DTOs.Request;

public class ConsultaUpdateRequest
{
    [DataValida("Data da consulta inválida.")]
    public DateOnly? DataConsulta { get; set; }

    [HoraValida("Horário da consulta inválido.")]
    public TimeOnly? HoraConsulta { get; set; }

    public bool? Retorno { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Dentista inválido.")]
    public int? IdDentista { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Paciente inválido.")]
    public int? IdPaciente { get; set; }
}
