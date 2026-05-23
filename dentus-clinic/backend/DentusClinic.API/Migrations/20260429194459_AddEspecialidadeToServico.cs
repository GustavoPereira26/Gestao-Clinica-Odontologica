using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DentusClinic.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEspecialidadeToServico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdEspecialidade",
                table: "Servicos",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Servicos_IdEspecialidade",
                table: "Servicos",
                column: "IdEspecialidade");

            migrationBuilder.AddForeignKey(
                name: "FK_Servicos_Especialidades_IdEspecialidade",
                table: "Servicos",
                column: "IdEspecialidade",
                principalTable: "Especialidades",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Servicos_Especialidades_IdEspecialidade",
                table: "Servicos");

            migrationBuilder.DropIndex(
                name: "IX_Servicos_IdEspecialidade",
                table: "Servicos");

            migrationBuilder.DropColumn(
                name: "IdEspecialidade",
                table: "Servicos");
        }
    }
}
