using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RulesRegulation.Models.Entities;

namespace RulesRegulation.Models
{
    [Table("SAVED_RECORDS")]
    public class SavedRecord
    {
        [Column("SAVED_ID")]
        public string SavedId { get; set; } = Guid.NewGuid().ToString();

        [Column("RECORD_ID")]
        public int RecordId { get; set; }

        [Column("USER_ID")]
        public int UserId { get; set; }

        [Column("SAVED_TIMESTAMP")]
        public string? SavedTimestamp { get; set; }

        [ForeignKey("RecordId")]
        public AddNewRecord? Record { get; set; }

        [ForeignKey("UserId")]
        public Users? User { get; set; }
    }
}