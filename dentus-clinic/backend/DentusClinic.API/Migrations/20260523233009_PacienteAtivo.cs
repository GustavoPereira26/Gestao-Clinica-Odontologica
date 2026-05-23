using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DentusClinic.API.Migrations
{
    /// <inheritdoc />
    public partial class PacienteAtivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // A coluna Ativo já existe no banco (adicionada por AddPacienteAtivo com default 0).
            // Ativa todos os pacientes existentes para que a listagem continue funcionando.
            migrationBuilder.Sql("UPDATE [Pacientes] SET [Ativo] = 1 WHERE [Ativo] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE [Pacientes] SET [Ativo] = 0");
        }
    }
}
