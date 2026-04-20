using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Login> Logins { get; set; }
    public DbSet<Especialidade> Especialidades { get; set; }
    public DbSet<Funcionario> Funcionarios { get; set; }
    public DbSet<Dentista> Dentistas { get; set; }
    public DbSet<Paciente> Pacientes { get; set; }
    public DbSet<Consulta> Consultas { get; set; }
    public DbSet<Atendimento> Atendimentos { get; set; }
    public DbSet<Prontuario> Prontuarios { get; set; }
    public DbSet<Servico> Servicos { get; set; }
    public DbSet<Planos> Planos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Login
        modelBuilder.Entity<Login>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Email).IsRequired().HasMaxLength(150);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Senha).IsRequired();
            e.Property(x => x.TipoAcesso).IsRequired().HasMaxLength(20);
        });

        // Especialidade
        modelBuilder.Entity<Especialidade>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).IsRequired().HasMaxLength(100);
        });

        // Funcionario
        modelBuilder.Entity<Funcionario>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).IsRequired().HasMaxLength(150);
            e.Property(x => x.Cpf).IsRequired().HasMaxLength(14);
            e.HasIndex(x => x.Cpf).IsUnique();
            e.Property(x => x.Cargo).IsRequired().HasMaxLength(20);
            e.HasOne(x => x.Login)
             .WithOne(x => x.Funcionario)
             .HasForeignKey<Funcionario>(x => x.IdAcesso)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Dentista
        modelBuilder.Entity<Dentista>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).IsRequired().HasMaxLength(150);
            e.Property(x => x.Cpf).IsRequired().HasMaxLength(14);
            e.HasIndex(x => x.Cpf).IsUnique();
            e.Property(x => x.Cro).IsRequired().HasMaxLength(20);
            e.HasIndex(x => x.Cro).IsUnique();
            e.HasOne(x => x.Especialidade)
             .WithMany(x => x.Dentistas)
             .HasForeignKey(x => x.IdEspecialidade)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Login)
             .WithOne(x => x.Dentista)
             .HasForeignKey<Dentista>(x => x.IdAcesso)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Paciente
        modelBuilder.Entity<Paciente>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).IsRequired().HasMaxLength(150);
            e.Property(x => x.Cpf).IsRequired().HasMaxLength(14);
            e.Property(x => x.Email).IsRequired().HasMaxLength(150);
            e.HasIndex(x => x.Cpf).IsUnique();
            e.HasIndex(x => x.Email).IsUnique();
        });

        // Consulta
        modelBuilder.Entity<Consulta>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).IsRequired().HasMaxLength(20);
            e.HasOne(x => x.Dentista)
             .WithMany(x => x.Consultas)
             .HasForeignKey(x => x.IdDentista)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Paciente)
             .WithMany(x => x.Consultas)
             .HasForeignKey(x => x.IdPaciente)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Servico)
             .WithMany()
             .HasForeignKey(x => x.IdServico)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Atendimento
        modelBuilder.Entity<Atendimento>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Consulta)
             .WithOne(x => x.Atendimento)
             .HasForeignKey<Atendimento>(x => x.IdConsulta)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Prontuario
        modelBuilder.Entity<Prontuario>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Paciente)
             .WithOne(x => x.Prontuario)
             .HasForeignKey<Prontuario>(x => x.IdPaciente)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Servico
        modelBuilder.Entity<Servico>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).IsRequired().HasMaxLength(100);
        });

        // Planos
        modelBuilder.Entity<Planos>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).IsRequired().HasMaxLength(20);
            e.HasOne(x => x.Prontuario)
             .WithMany(x => x.Planos)
             .HasForeignKey(x => x.IdProntuario)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Servico)
             .WithMany(x => x.Planos)
             .HasForeignKey(x => x.IdServico)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
