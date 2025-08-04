namespace Rules_Regulation.Models.Entities
{
    public class Visit
    {
        public int VisitId { get; set; }
        public int UserId { get; set; }
        public string? IPAddress { get; set; }
        public DateTime VisitTimestamp { get; set; }
        
    }
}