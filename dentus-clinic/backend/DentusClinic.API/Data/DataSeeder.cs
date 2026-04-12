using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (!await context.Especialidades.AnyAsync())
        {
            context.Especialidades.AddRange(
                new Especialidade { Nome = "Clínica Geral" },
                new Especialidade { Nome = "Ortodontia" },
                new Especialidade { Nome = "Endodontia" },
                new Especialidade { Nome = "Periodontia" },
                new Especialidade { Nome = "Implantodontia" }
            );
            await context.SaveChangesAsync();
        }

        if (!await context.Servicos.AnyAsync())
        {
            context.Servicos.AddRange(
                new Servico { Nome = "Consulta de Rotina" },
                new Servico { Nome = "Limpeza" },
                new Servico { Nome = "Restauração" },
                new Servico { Nome = "Extração" },
                new Servico { Nome = "Canal" },
                new Servico { Nome = "Ortodontia" },
                new Servico { Nome = "Clareamento" },
                new Servico { Nome = "Raio-X" }
            );
            await context.SaveChangesAsync();
        }

        if (!await context.Logins.AnyAsync())
        {
            var loginAdm = new Login
            {
                Email = "admin@dentusclinic.com",
                Senha = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                TipoAcesso = "ADM"
            };
            context.Logins.Add(loginAdm);
            await context.SaveChangesAsync();
        }
    }
}
