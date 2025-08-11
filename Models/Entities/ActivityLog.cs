using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RulesRegulation.Models.Entities
{
    /// <summary>
    /// Entity representing activity logs for tracking privileged user actions
    /// </summary>
    public class ActivityLog
    {
        [Key]
        [Column("LOG_ID")]
        public int LogId { get; set; }

        [Required]
        [Column("ACTION_TYPE")]
        [MaxLength(50)]
        public string ActionType { get; set; } = string.Empty; // Add, Edit, Delete

        [Required]
        [Column("ENTITY_TYPE")]
        [MaxLength(50)]
        public string EntityType { get; set; } = string.Empty; // Record, Contact

        [Column("ENTITY_ID")]
        public int? EntityId { get; set; }

        [Column("ENTITY_NAME")]
        [MaxLength(500)]
        public string? EntityName { get; set; }

        [Required]
        [Column("USER_ID")]
        public int UserId { get; set; }

        [Required]
        [Column("USER_NAME")]
        [MaxLength(200)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [Column("USER_ROLE")]
        [MaxLength(50)]
        public string UserRole { get; set; } = string.Empty; // Admin, Editor

        [Column("OLD_VALUES")]
        public string? OldValues { get; set; } // JSON string for edit operations

        [Column("NEW_VALUES")]
        public string? NewValues { get; set; } // JSON string for add/edit operations

        [Column("CHANGES_SUMMARY")]
        [MaxLength(1000)]
        public string? ChangesSummary { get; set; } // Human-readable summary of changes

        [Required]
        [Column("ACTION_TIMESTAMP")]
        public DateTime ActionTimestamp { get; set; } = DateTime.UtcNow;

        [Column("IP_ADDRESS")]
        [MaxLength(50)]
        public string? IpAddress { get; set; }

        [Column("DETAILS")]
        public string? Details { get; set; } // Additional details about the action

        // Navigation property to Users
        public Users? User { get; set; }
    }
}
