using RulesRegulation.Models.Entities;

public class Attachment
{
    public int Id { get; set; } // maps to ATTACHMENT_ID
    public int AddNewRecordId { get; set; } // maps to RECORD_ID

    public string? FileType { get; set; }
    public string? FilePath { get; set; }
    public DateTime? UploadDate { get; set; }

    public AddNewRecord? AddNewRecord { get; set; }
}
