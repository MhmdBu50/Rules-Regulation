using System.ComponentModel.DataAnnotations.Schema;

namespace RulesRegulation.Models.Entities
{
    public class AddNewRecord
    {
        public int Id { get; set; }
        public string RegulationName { get; set; }
        public string Department { get; set; }
        public string Version { get; set; }
        public DateTime VersionDate { get; set; }
        public string ApprovingEntity { get; set; }
        public DateTime ApprovingDate { get; set; }

        [NotMapped]
        public IFormFile WordAttachment { get; set; }
        [NotMapped]
        public IFormFile PdfAttachment { get; set; }

        public string Description { get; set; }
        public string DocumentType { get; set; }
        public List<string> Sections { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string Notes { get; set; }
    
        public ICollection<Attachment> Attachments { get; set; }
        public ICollection<SavedRecord> SavedRecords { get; set; }

    }
}