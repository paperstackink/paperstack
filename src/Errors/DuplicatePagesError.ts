export class DuplicatePagesError extends Error {
    constructor(message?: string) {
        super(message);

        this.name = "DuplicatePagesError";
    }
}
