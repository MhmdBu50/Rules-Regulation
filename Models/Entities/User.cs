using System;
using System.Collections.Generic;

using System.ComponentModel.DataAnnotations.Schema;

namespace RulesRegulation.Models.Entities
{
    [Table("USERS")]
    public class User
    {
        public decimal UserId { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
    }
}
