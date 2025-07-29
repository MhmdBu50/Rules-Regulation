namespace RulesRegulation.Models.Entities;

[System.ComponentModel.DataAnnotations.Schema.Table("USERS")]
public class Users
{
    public int UserId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Password { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}