public class AddNewRecordViewModel
{
    public string RegulationName { get; set; }
    public string RelevantDepartment { get; set; }
    public string VersionNumber { get; set; }
    public DateTime VersionDate { get; set; }
    public string ApprovingEntity { get; set; }
    public DateTime ApprovingDate { get; set; }
    public IFormFile WordAttachment { get; set; }
    public IFormFile PdfAttachment { get; set; }
    public string Description { get; set; }
    public string DocumentType { get; set; }
    public List<string> Sections { get; set; }
    public string Notes { get; set; }
}