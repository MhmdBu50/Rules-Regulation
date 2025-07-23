using Microsoft.EntityFrameworkCore;
using RulesRegulation.Models.Entities;

namespace RulesRegulation.Models
{
    public class RRdbContext : DbContext
    {
        public RRdbContext(DbContextOptions<RRdbContext> options) : base(options)
        {
        }

        public DbSet<ContactInformation> ContactInformations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure ContactInformation
            modelBuilder.Entity<ContactInformation>(entity =>
            {
                entity.ToTable("CONTACT_INFORMATION");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.Department).HasColumnName("DEPARTMENT").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Name).HasColumnName("NAME").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Email).HasColumnName("EMAIL").HasMaxLength(200);
                entity.Property(e => e.Mobile).HasColumnName("MOBILE").HasMaxLength(20);
                entity.Property(e => e.Telephone).HasColumnName("TELEPHONE").HasMaxLength(20);
            });
        }
    }
}
