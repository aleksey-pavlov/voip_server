import { RegistryProviderStorage } from "./RegistryProviderStorage";

export type NumberProviderResponse = {
    def: number,
    provider: string,
    providerId: string,
    region: string,
    timeZone: number
};

export class NumberValidationError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class ErrorInvalidFormat extends NumberValidationError {
    constructor() {
        super("InvalidPhoneNumberFormat");
    }
}

export class ErrorInvalidContryCode extends NumberValidationError {
    constructor() {
        super("InvalidCountryCodePhoneNumber");
    }
}

export class NumberProvider {

    public constructor(private providersRegistry: RegistryProviderStorage,
        private allowedContryCodes: string[]) {
    }

    private validateNumber(number: string) {

        if (number[0] !== "+")
            throw new ErrorInvalidFormat();

        let contryCode = number.slice(0, 2);
        if (this.allowedContryCodes.length > 0 && this.allowedContryCodes.indexOf(contryCode) < 0)
            throw new ErrorInvalidContryCode();

    }

    private getDef(number: string): string {
        let start = 2;
        let end = 5;
        let def = number.slice(start, end);
        return def;
    }

    private getCapacity(number: string): string {
        let start = 5;
        let capacity = number.slice(start);
        return capacity;
    }

    public async getProvider(number: string): Promise<NumberProviderResponse> {

        this.validateNumber(number);
        let def = this.getDef(number);
        let capacity = this.getCapacity(number);
        let provider = await this.providersRegistry.get(def, capacity);

        return {
            def: +def,
            provider: provider.provider,
            providerId: provider.providerId,
            region: provider.region,
            timeZone: provider.timeZone
        };
    }
}