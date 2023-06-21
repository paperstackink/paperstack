import nodePath from "path";
import * as Strings from "@/Utilities/Strings";

export function getExtension(path: string): string {
    const extension = nodePath.extname(path);

    return extension.replace(".", "");
}

export function getFileName(path: string): string {
    const extension = getExtension(path);
    return nodePath.basename(path, `.${extension}`);
}

export function buildFileName(name: string, extension: string): string {
    return `${name}.${extension}`;
}

export function buildPath(...items: string[]): string {
    return nodePath.resolve(...items);
}

export function concatenate(...items: string[]): string {
    return nodePath.join(...items);
}

export function subtract(path: string, segment: string) {
    const relativePath = path.replace(segment, "");

    if (relativePath === "") {
        return "/";
    }

    return relativePath;
}

export function slugify(input: string): string {
    if (input === "/") {
        return "/";
    }

    const output = Strings.split(input, "/")
        .map(segment => Strings.kebab(segment))
        .join("/");

    return Strings.prepend(output, "/");
}
