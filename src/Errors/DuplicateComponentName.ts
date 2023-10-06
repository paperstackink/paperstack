import { BuildError } from "@/Errors/BuildError";

export class DuplicateComponentName extends BuildError {
    protected output: string;

    constructor(name: string, names: string[]) {
        super();

        Object.setPrototypeOf(this, DuplicateComponentName.prototype);
        this.name = "DuplicateComponentName";
        this.output = this.format(name, names);
    }

    format(name: string, names: string[]): string {
        const list = names.map(name => `     -  ${name}`).join("\n");

        return `-----  Error: Duplicate components  ----------------------

You have multiple components called "${name}", which is not allowed.

The components are located here:
${list}

It's not possible to have multiple components with the same name, even if they are in different directories.
This is to allow referencing a component by name, without needing to import it.
`;
    }
}
