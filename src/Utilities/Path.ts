import nodePath from "path";
import * as Strings from "@/Utilities/Strings";

export function getRootDirectory() {
    return nodePath.resolve(".");
}

// Note: This assumes the command is called from the project root
export function getOutputDirectory() {
    const root = getRootDirectory();

    return buildPath(root, "Output");
}

// Note: This assumes the command is called from the project root
export function getPagesDirectory() {
    const root = getRootDirectory();

    return buildPath(root, "Pages");
}

// Note: This assumes the command is called from the project root
export function getComponentsDirectory() {
    const root = getRootDirectory();

    return buildPath(root, "Components");
}

// Note: This assumes the command is called from the project root
export function getConfigDirectory() {
    const root = getRootDirectory();

    return buildPath(root, "Config");
}

// Note: This assumes the command is called from the project root
export function getAssetsDirectory() {
    const root = getRootDirectory();

    return buildPath(root, "Assets");
}

export function getExtension(path: string): string {
    const extension = nodePath.extname(path);

    return extension.replace(".", "");
}

export function getFileName(path: string): string {
    const extension = getExtension(path);

    return nodePath.basename(path, `.${extension}`);
}

export function getDirectory(path: string): string {
    return nodePath.dirname(path);
}

export function buildFileName(name: string, extension: string): string {
    return `${name}.${extension}`;
}

export function buildPath(...items: string[]): string {
    return nodePath.resolve(...items);
}

export function buildPathFromRoot(...items: string[]): string {
    const root = getRootDirectory();

    return nodePath.resolve(root, ...items);
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
