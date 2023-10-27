import { BuildError } from "@/Errors/BuildError";

export class MissingDirectory extends BuildError {
    protected output: string;

    constructor(directory: string) {
        super();

        Object.setPrototypeOf(this, MissingDirectory.prototype);
        this.name = "MissingDirectory";
        this.output = this.format(directory);
    }

    format(directory: string): string {
        return `-----  Error: Missing directory  ----------------------

It seems like this project is missing the '${directory}' directory.

Check out this repository to see if you are missing any files: https://github.com/paperstackink/docs
`;
    }
}
