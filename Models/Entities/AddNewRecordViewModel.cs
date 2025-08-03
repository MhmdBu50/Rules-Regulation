public class AddNewRecordViewModel
{
    public int RecordId { get; set; } 
    
    // Regulation Name in both languages
    public string? RegulationName { get; set; }
    public string? RegulationNameAr { get; set; }
    
    public string? RelevantDepartment { get; set; }
    public string? VersionNumber { get; set; }
    public DateTime VersionDate { get; set; }
    
    // Approving Entity in both languages
    public string? ApprovingEntity { get; set; }
    public string? ApprovingEntityAr { get; set; }
    
    public DateTime ApprovingDate { get; set; }
    public IFormFile? WordAttachment { get; set; }
    public IFormFile? PdfAttachment { get; set; }
    
    // Brief Description in both languages
    public string? Description { get; set; }
    public string? DescriptionAr { get; set; }
    
    public string? DocumentType { get; set; }
    public List<string>? Sections { get; set; }
    
    // Notes in both languages
    public string? Notes { get; set; }
    public string? NotesAr { get; set; }
}