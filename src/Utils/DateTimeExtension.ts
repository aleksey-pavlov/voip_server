import moment = require("moment");

export function getHour(date: string, format: string): number {
    return moment(date, format).hour();
}