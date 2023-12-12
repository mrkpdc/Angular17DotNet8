using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace be.DB.Entities.AuthEntities
{
    public class Role : IdentityRole
    {
        [NotMapped]
        public List<IdentityRoleClaim<string>> RoleClaims { get; set; } = new List<IdentityRoleClaim<string>>();
    }
}