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
            // Garante que a coluna Ativo existe antes de tentar atualizar os dados.
            // Necessário pois em bancos limpos a coluna pode ainda não ter sido adicionada
            // pela migration anterior dependendo da ordem de execução.
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE Name = 'Ativo'
                    AND Object_ID = Object_ID('Pacientes')
                )
                BEGIN
                    UPDATE [Pacientes] SET [Ativo] = 1 WHERE [Ativo] = 0;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE Name = 'Ativo'
                    AND Object_ID = Object_ID('Pacientes')
                )
                BEGIN
                    UPDATE [Pacientes] SET [Ativo] = 0;
                END
            ");
        }
    }
}
