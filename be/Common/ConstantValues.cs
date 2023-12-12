using System.Net;

namespace be.Common
{
    public static class ConstantValues
    {
        public static class Auth
        {            
            public const string AuthSettings = "AuthSettings";
            public const string DomainName = "DomainName";
            public const string DomainHost = "DomainHost";
            public const string DomainPort = "DomainPort";
            public const string ConnectionTimeout = "ConnectionTimeout";
            public const string UseSSL = "UseSSL";
            public const string CheckOnAD = "CheckOnAD";
            public const string Cookie = "Cookie";
            public const string CookieExpiry = "CookieExpiry";
            public const string LDAP = "LDAP";
            public static class Claims
            {
                public static class Types
                {
                    public const string CANDOANYTHING = "CANDOANYTHING";
                    public const string CanRegisterToSignalR = "CanRegisterToSignalR";
                    public const string CanSendSignalRMessageToBroadcast = "CanSendSignalRMessageToBroadcast";
                    public const string CanSendSignalRMessageToClient = "CanSendSignalRMessageToClient";
                    public const string CanSendSignalRMessageToConnection = "CanSendSignalRMessageToConnection";
                    public const string CanSendSignalRMessageToUser = "CanSendSignalRMessageToUser";
                }
                public static class Values
                {
                    public const string True = "True";
                    public const string False = "False";
                }
            }

        }

        public static class ServicesHttpResponses
        {
            public static readonly (object Result, HttpStatusCode StatusCode) BadRequest = ("BadRequest", HttpStatusCode.BadRequest);
            public static readonly (object Result, HttpStatusCode StatusCode) InternalServerError = ("InternalServerError", HttpStatusCode.InternalServerError);
            public static readonly (object Result, HttpStatusCode StatusCode) ItemDoesntExist = ("ItemDoesntExist", HttpStatusCode.BadRequest);
            public static readonly (object Result, HttpStatusCode StatusCode) LoggedIn = ("LoggedIn", HttpStatusCode.OK);
            public static readonly (object Result, HttpStatusCode StatusCode) LoginFailed = ("LoginFailed", HttpStatusCode.BadRequest);
            public static readonly (object Result, HttpStatusCode StatusCode) OK = ("OK", HttpStatusCode.OK);
            public static readonly (object Result, HttpStatusCode StatusCode) UserDoesntExist = ("UserDoesntExist", HttpStatusCode.BadRequest);
        }
    }
}
