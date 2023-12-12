using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using be.DB.Entities.AuthEntities;

namespace be.DB.Contexts
{
    public class AuthDBContext : IdentityDbContext<User, Role, string>
    {
        public AuthDBContext(DbContextOptions<AuthDBContext> options)
            : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
        }
    }
}