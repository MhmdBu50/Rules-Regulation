using Microsoft.EntityFrameworkCore;
using RulesRegulation.Models.Entities;

namespace RulesRegulation.Models
{
    public class RRdbContext : DbContext
    {
        public RRdbContext(DbContextOptions<RRdbContext> options) : base(options) { }

        public DbSet<ContactInformation> ContactInformations { get; set; }
        public DbSet<AddNewRecord> AddNewRecords { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<Users> Users { get; set; }
        public DbSet<SavedRecord> SavedRecords { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ContactInformation config
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

            // AddNewRecord config
            modelBuilder.Entity<AddNewRecord>(entity =>
            {
                entity.ToTable("RECORDS"); // Oracle: all caps or use quotes
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("RECORD_ID");
                entity.Property(e => e.RegulationName).HasColumnName("REGULATION_NAME").HasMaxLength(255);
                entity.Property(e => e.Notes).HasColumnName("NOTES");
                entity.Property(e => e.Version).HasColumnName("VERSION").HasMaxLength(50);
                entity.Property(e => e.Description).HasColumnName("DESCRIPTION");
                entity.Property(e => e.Department).HasColumnName("DEPARTMENT").HasMaxLength(100);
                entity.Property(e => e.DocumentType).HasColumnName("DOCUMENT_TYPE").HasMaxLength(100);
                entity.Property(e => e.VersionDate).HasColumnName("VERSION_DATE");
                entity.Property(e => e.ApprovingDate).HasColumnName("APPROVAL_DATE");
                entity.Property(e => e.Sections).HasColumnName("SECTIONS");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATED_AT");
                entity.Property(e => e.ApprovingEntity).HasColumnName("APPROVING_ENTITY").HasMaxLength(255);
            });

            modelBuilder.Entity<Attachment>(entity =>
            {
                entity.ToTable("ATTACHMENTS");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("ATTACHMENT_ID");

                entity.Property(e => e.AddNewRecordId).HasColumnName("RECORD_ID");

                entity.Property(e => e.FileType)
                .HasColumnName("FILE_TYPE")
                .HasMaxLength(50);

                entity.Property(e => e.FilePath)
                .HasColumnName("FILE_PATH")
                .HasMaxLength(500);

                entity.Property(e => e.UploadDate)
                .HasColumnName("UPLOAD_DATE");

                // Relationship
                entity.HasOne(a => a.AddNewRecord)
                .WithMany(r => r.Attachments)
                .HasForeignKey(a => a.AddNewRecordId)
                .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<Users>(entity =>
            {
                entity.ToTable("USERS"); // Match your Oracle table name

                entity.HasKey(e => e.UserId).HasName("PK_USERS");

                entity.Property(e => e.UserId).HasColumnName("USER_ID");
                entity.Property(e => e.Name).HasColumnName("NAME");
                entity.Property(e => e.Email).HasColumnName("EMAIL");
                entity.Property(e => e.PhoneNumber).HasColumnName("PHONE_NUMBER");
                entity.Property(e => e.Password).HasColumnName("PASSWORD");
                entity.Property(e => e.CreatedAt).HasColumnName("CREATED_AT");
                entity.Property(e => e.UpdatedAt).HasColumnName("UPDATED_AT");
                entity.Property(e => e.Role).HasColumnName("ROLE"); // Add missing Role mapping
            });
            modelBuilder.Entity<SavedRecord>(entity =>
            {
                entity.ToTable("SAVED_RECORDS");

                // 🔐 Composite primary key: (USER_ID, RECORD_ID)
                entity.HasKey(e => new { e.UserId, e.RecordId }).HasName("PK_SAVED_RECORDS");

                // 🔁 Property to column mappings
                entity.Property(e => e.UserId).HasColumnName("USER_ID");
                entity.Property(e => e.RecordId).HasColumnName("RECORD_ID");
                entity.Property(e => e.SavedTimestamp).HasColumnName("SAVED_TIMESTAMP");
                entity.Property(e => e.SavedId).HasColumnName("SAVED_ID");

                // 🔗 Foreign key to AddNewRecord
                entity.HasOne(e => e.Record)
                    .WithMany(r => r.SavedRecords)
                    .HasForeignKey(e => e.RecordId)
                    .HasConstraintName("FK_SAVED_RECORDS_RECORDS");

                // 🔗 Foreign key to Users (optional)
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .HasConstraintName("FK_SAVED_RECORDS_USERS");
            });
        }
    }
}