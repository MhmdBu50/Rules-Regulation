using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RulesRegulation.Models.Entities
{
    [Table("CONTACT_INFORMATION")]
    public class ContactInformation
    {
        [Key]
        [Column("ID")]
        public int Id { get; set; }

        [Required]
        [Column("DEPARTMENT")]
        [MaxLength(100)]
        public string Department { get; set; } = string.Empty;

        [Required]
        [Column("NAME")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("NAME_AR")]
        [MaxLength(200)]
        public string? NameAr { get; set; }

        [Column("EMAIL")]
        [MaxLength(200)]
        public string? Email { get; set; }

        [Column("MOBILE")]
        [MaxLength(20)]
        public string? Mobile { get; set; }

        [Column("TELEPHONE")]
        [MaxLength(20)]
        public string? Telephone { get; set; }
    }
}
