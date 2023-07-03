import * as Path from "@/Utilities/Path";
import * as Strings from "@/Utilities/Strings";
import * as Terminal from "@/Utilities/Terminal";
import * as Filesystem from "@/Utilities/Filesystem";
import { Command } from "@/Commands/Command";

export default class MakePage extends Command {
    static command = "make:page";
    static description = "Create a new page";

    async handle({ options }: { options: string[] }): Promise<void> {
        Terminal.clear();

        if (options.length < 1) {
            Terminal.error(
                "Please provide a path where the new component should be created",
            );

            return;
        }

        let path = options[0];

        // If it doesn't contain uppercase letters we assume it's the URL path
        if (path === path.toLowerCase()) {
            path = path
                .split("/")
                .map(piece => Strings.pascal(piece))
                .join("/");
        }

        if (path.startsWith("/Pages")) {
            // Noop
        } else if (path.startsWith("Pages")) {
            path = `/${path}`;
        } else if (path.startsWith("/")) {
            path = `/Pages${path}`;
        } else {
            path = `/Pages/${path}`;
        }

        if (!path.endsWith(".stencil")) {
            path = `${path}.stencil`;
        }

        const relativePath = path;

        // Remove the first '/' so the path resolves inside the root folder
        path = path.slice(1);

        path = Path.buildPathFromRoot(path);

        console.log("PATH", path);

        if (await Filesystem.exists(path)) {
            Terminal.error(`'${relativePath}' already exists`);

            return;
        }

        const directory = Path.getDirectory(path);

        Filesystem.createDirectory(directory);
        Filesystem.writeFile(path, "");

        Terminal.write(`'${relativePath}' was created`);
    }

    async catch(): Promise<void> {}

    help(): void {
        Terminal.clear();
        Terminal.write("Usage: paper make:page <path>");
        Terminal.line();

        Terminal.write("This command creates a new page.");
        Terminal.line();

        Terminal.write("Parameters: This command has 1 parameter");
        Terminal.write(
            `   path  |  The path to the new page or the URL of the new page`,
        );
    }
}
