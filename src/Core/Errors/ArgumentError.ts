export class ArgumentNullError extends Error {

    constructor(argument: string) {
        super(`Argument null exception ${argument}`);
    }

}