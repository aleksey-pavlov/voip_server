export class ClientsErrors {
    static readonly EMPTY_REQUEST_BODY = "EmptyRequestBody";
    static readonly INCORRECT_CKEY = "IncorrectCkey";
    static readonly CLIENT_IS_BLOCKED = "ClientIsBlocked";
    static readonly VALIDATION_IP_ERROR = "ValidationErrorIp";
    static readonly DAILY_OVER_LIMIT = "DailyOverLimit";
}

export class ClientTaskAlreadyExists extends Error {

    constructor(from: string, to: string) {
        super(`Task from=${from} to=${to} already exist`);
    }

}

export class ClientTaskNotFound extends Error {
    constructor(from: string, to: string) {
        super(`Task by from=${from} to=${to} not found`);
    }
}