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
            // SQL Server compila o batch inteiro antes de executar, por isso o IF EXISTS
            // simples nao funciona quando a coluna nao existe ainda.
            // Usar EXEC com SQL dinamico evita a compilacao antecipada.
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE name = 'Ativo'
                    AND object_id = OBJECT_ID(N'Pacientes')
                )
                BEGIN
                    EXEC(N'UPDATE [Pacientes] SET [Ativo] = 1 WHERE [Ativo] = 0');
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE name = 'Ativo'
                    AND object_id = OBJECT_ID(N'Pacientes')
                )
                BEGIN
                    EXEC(N'UPDATE [Pacientes] SET [Ativo] = 0');
                END
            ");
        }
    }
}
