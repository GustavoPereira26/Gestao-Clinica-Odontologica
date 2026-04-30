using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DentusClinic.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoverLoginIdOrfao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'Funcionarios' AND COLUMN_NAME = 'LoginId'
                )
                BEGIN
                    DECLARE @fkFunc NVARCHAR(256) = (
                        SELECT name FROM sys.foreign_keys
                        WHERE parent_object_id = OBJECT_ID('Funcionarios')
                          AND name LIKE '%LoginId%'
                    );
                    IF @fkFunc IS NOT NULL
                        EXEC('ALTER TABLE Funcionarios DROP CONSTRAINT [' + @fkFunc + ']');

                    DECLARE @dfFunc NVARCHAR(256) = (
                        SELECT dc.name FROM sys.default_constraints dc
                        JOIN sys.columns c ON dc.parent_object_id = c.object_id
                            AND dc.parent_column_id = c.column_id
                        WHERE dc.parent_object_id = OBJECT_ID('Funcionarios')
                          AND c.name = 'LoginId'
                    );
                    IF @dfFunc IS NOT NULL
                        EXEC('ALTER TABLE Funcionarios DROP CONSTRAINT [' + @dfFunc + ']');

                    ALTER TABLE Funcionarios DROP COLUMN LoginId;
                END;

                IF EXISTS (
                    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'Dentistas' AND COLUMN_NAME = 'LoginId'
                )
                BEGIN
                    DECLARE @fkDent NVARCHAR(256) = (
                        SELECT name FROM sys.foreign_keys
                        WHERE parent_object_id = OBJECT_ID('Dentistas')
                          AND name LIKE '%LoginId%'
                    );
                    IF @fkDent IS NOT NULL
                        EXEC('ALTER TABLE Dentistas DROP CONSTRAINT [' + @fkDent + ']');

                    DECLARE @dfDent NVARCHAR(256) = (
                        SELECT dc.name FROM sys.default_constraints dc
                        JOIN sys.columns c ON dc.parent_object_id = c.object_id
                            AND dc.parent_column_id = c.column_id
                        WHERE dc.parent_object_id = OBJECT_ID('Dentistas')
                          AND c.name = 'LoginId'
                    );
                    IF @dfDent IS NOT NULL
                        EXEC('ALTER TABLE Dentistas DROP CONSTRAINT [' + @dfDent + ']');

                    ALTER TABLE Dentistas DROP COLUMN LoginId;
                END;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
