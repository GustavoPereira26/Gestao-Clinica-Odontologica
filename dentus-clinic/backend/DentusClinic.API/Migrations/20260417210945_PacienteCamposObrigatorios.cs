using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DentusClinic.API.Migrations
{
    /// <inheritdoc />
    public partial class PacienteCamposObrigatorios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "Pacientes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Endereco",
                table: "Pacientes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            // O SQL Server não permite ALTER COLUMN enquanto há índice na coluna.
            // Dropa o índice único antes, altera a coluna e o recria em seguida.
            migrationBuilder.DropIndex(
                name: "IX_Pacientes_Email",
                table: "Pacientes");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pacientes",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

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
                name: "Telefone",
                table: "Pacientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Endereco",
                table: "Pacientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pacientes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_Email",
                table: "Pacientes",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");
        }
    }
}
