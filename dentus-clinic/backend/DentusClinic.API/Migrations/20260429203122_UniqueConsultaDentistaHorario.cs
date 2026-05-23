using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DentusClinic.API.Migrations
{
    /// <inheritdoc />
    public partial class UniqueConsultaDentistaHorario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Impede que o mesmo dentista tenha duas consultas não-canceladas no mesmo dia e horário
            migrationBuilder.Sql(@"
                CREATE UNIQUE INDEX IX_Consultas_Dentista_Data_Hora_Ativo
                ON Consultas (IdDentista, DataConsulta, HoraConsulta)
                WHERE Status <> 'Cancelada';
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS IX_Consultas_Dentista_Data_Hora_Ativo ON Consultas;");
        }
    }
}
