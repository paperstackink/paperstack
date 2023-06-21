import { kebabCase } from "lodash";

export function split(input: string, delimiter: string): string[] {
    // Filter out empty part of delimiter
    return input.split(delimiter).filter(segment => segment);
}

export function kebab(input: string): string {
    return kebabCase(input);
}

export function prepend(input: string, prepend: string): string {
    return prepend + input;
}
