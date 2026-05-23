using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DentusClinic.API.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarServicoNaConsulta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdServico",
                table: "Consultas",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_IdServico",
                table: "Consultas",
                column: "IdServico");

            migrationBuilder.AddForeignKey(
                name: "FK_Consultas_Servicos_IdServico",
                table: "Consultas",
                column: "IdServico",
                principalTable: "Servicos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Consultas_Servicos_IdServico",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_IdServico",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "IdServico",
                table: "Consultas");
        }
    }
}
