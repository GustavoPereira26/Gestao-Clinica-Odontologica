using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DentusClinic.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPacienteEmailUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pacientes",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            // Remove duplicatas e seus registros dependentes, mantendo apenas o de menor Id por email
            migrationBuilder.Sql(@"
                DECLARE @duplicados TABLE (Id INT);

                INSERT INTO @duplicados
                SELECT Id FROM Pacientes
                WHERE Id NOT IN (
                    SELECT MIN(Id) FROM Pacientes GROUP BY Email
                );

                -- Planos dependem de Prontuarios
                DELETE FROM Planos
                WHERE IdProntuario IN (
                    SELECT Id FROM Prontuarios WHERE IdPaciente IN (SELECT Id FROM @duplicados)
                );

                -- Prontuarios
                DELETE FROM Prontuarios
                WHERE IdPaciente IN (SELECT Id FROM @duplicados);

                -- Atendimentos dependem de Consultas
                DELETE FROM Atendimentos
                WHERE IdConsulta IN (
                    SELECT Id FROM Consultas WHERE IdPaciente IN (SELECT Id FROM @duplicados)
                );

                -- Consultas
                DELETE FROM Consultas
                WHERE IdPaciente IN (SELECT Id FROM @duplicados);

                -- Pacientes duplicados
                DELETE FROM Pacientes
                WHERE Id IN (SELECT Id FROM @duplicados);
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_Email",
                table: "Pacientes",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pacientes_Email",
                table: "Pacientes");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pacientes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);
        }
    }
}
