export namespace Http
{
    export class StatusCode
    {
        static readonly OK = 200;
        static readonly BAD_REQUEST = 400;
        static readonly UNAUTHORIZED = 401;
        static readonly FORBIDDEN = 403;
        static readonly NOT_FOUND = 404;
        static readonly INTERNAL_SERVER_ERROR = 500;
        static readonly BANDWIDTH_LIMIT_EXCEEDED = 509;
    }

    export class Methods
    {
        static readonly GET = "GET";
        static readonly POST = "POST";
        static readonly PUT = "PUT";
        static readonly DELETE = "DELETE";
    }
}