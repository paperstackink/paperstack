import fs from "node:fs/promises";
import * as Path from "@/Utilities/Path";

type File = {
    directory: string;
    name: string;
    path: string; // directory + name
    type: "stencil" | "html" | "unknown";
    contents: string;
};

export async function files(path: string): Promise<File[]> {
    const results = await fs.readdir(path, {
        withFileTypes: true,
        recursive: false,
    });

    const mapped = results.map(async result => {
        if (!result.isFile()) {
            const path = Path.buildPath(result.path, result.name);

            const nested = await files(path);

            return nested;
        }

        const type = Path.getExtension(result.name);

        if (type !== "stencil") {
            throw new Error(
                "The 'Pages' directory must only contain '.stencil' files.",
            );
        }

        const directory = result.path;
        const name = Path.getFileName(result.name);
        const path = Path.buildPath(directory, result.name);

        const contents = await readFile(path);

        const file: File = {
            directory,
            name,
            path: path, // directory + name
            type: "stencil" as "stencil",
            contents: contents,
        };

        return [file];
    });

    const output = await Promise.all(mapped);

    return output.flat(1);
}

export async function readFile(path: string): Promise<string> {
    const contents = await fs.readFile(path, { encoding: "utf-8" });

    return contents;
}

export async function writeFile(path: string, contents: string): Promise<void> {
    await fs.writeFile(path, contents);
}

export async function removeDirectory(path: string): Promise<void> {
    await fs.rm(path, { recursive: true, force: true });
}

export async function createDirectory(path: string): Promise<void> {
    await fs.mkdir(path, { recursive: true });
}

export async function exists(path: string): Promise<boolean> {
    try {
        await fs.access(path);

        return true;
    } catch (_) {
        return false;
    }
}
