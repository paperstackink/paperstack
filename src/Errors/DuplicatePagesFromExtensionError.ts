import { BuildError } from "@/Errors/BuildError";

export class DuplicatePagesFromExtensionError extends BuildError {
    protected output: string;

    constructor(url: string, files: string[]) {
        super();

        Object.setPrototypeOf(this, DuplicatePagesFromExtensionError.prototype);
        this.name = "DuplicatePagesFromExtensionError";
        this.output = this.format(url, files);
    }

    format(url: string, files: string[]): string {
        const list = files.map(file => `     -  ${file}`).join("\n");

        return `-----  Error: Duplicate pages  ----------------------

You have multiple pages with the url "${url}".

The pages are located here:
${list}

This error most likely occured because you are using the same file name with different extensions.
`;
    }
}
