import { kebabCase, camelCase, startCase } from "lodash";

export function split(input: string, delimiter: string): string[] {
    // Filter out empty part of delimiter
    return input.split(delimiter).filter(segment => segment);
}

export function kebab(input: string): string {
    return kebabCase(input);
}

export function pascal(input: string): string {
    return startCase(camelCase(input)).replace(/ /g, "");
}

export function prepend(input: string, prepend: string): string {
    return prepend + input;
}
