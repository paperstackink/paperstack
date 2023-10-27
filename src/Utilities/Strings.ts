import { kebabCase, camelCase, startCase } from "lodash";

export function split(input: string, delimiter: string): string[] {
    // Filter out empty part of delimiter
    return input.split(delimiter).filter(segment => segment);
}

export function kebab(input: string): string {
    const converted = kebabCase(input);

    // kebabCase from Lodash adds a dash between letters and numbers: V0 -> v-0
    // We want to avoid automatically doing that
    // So we find all instances of '-n' and replace it with 'n'
    const normalised = converted.replaceAll(/-([0,9]+)/g, "$1");

    return normalised;
}

export function pascal(input: string): string {
    return startCase(camelCase(input)).replace(/ /g, "");
}

export function prepend(input: string, prepend: string): string {
    return prepend + input;
}

export function after(input: string, character: string): string {
    return input.slice(input.indexOf(character) + 1);
}
