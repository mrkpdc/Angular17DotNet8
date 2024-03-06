using be.Common;
using be.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace be.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        protected readonly ILogger<AuthController> logger;
        public NotificationsController(ILogger<AuthController> logger)
        {
            this.logger = logger;
        }
        [HttpGet("GetUnreadNotifications")]
        public async Task<object> GetUnreadNotifications()
        {

            try
            {
                //var result = notificationsService.GetUnreadNotifications(userId);
                //Response.StatusCode = (int)result.StatusCode;
                //return result.Result;
                Response.StatusCode = 200;
                Random r = new Random();
                return new string[] {
                    "value" + r.Next(0, 10),
                    "value" + r.Next(0, 10),
                    "value" + r.Next(0, 10),
                    "value" + r.Next(0, 10),
                    "value" + r.Next(0, 10),
                    "value" + r.Next(0, 10)
                };
            }
            catch (Exception ex)
            {
                this.logger.Log(LogLevel.Error, ex, string.Empty);
                Response.StatusCode = (int)ConstantValues.ServicesHttpResponses.InternalServerError.StatusCode;
                return new
                {
                    result = ConstantValues.ServicesHttpResponses.InternalServerError.Result
                };
            }
        }
    }
}
