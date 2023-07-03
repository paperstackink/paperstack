import * as Path from "@/Utilities/Path";
import * as Terminal from "@/Utilities/Terminal";
import * as Filesystem from "@/Utilities/Filesystem";
import { Command } from "@/Commands/Command";

export default class MakeComponent extends Command {
    static command = "make:component";
    static description = "Create a new component";

    async handle({ options }: { options: string[] }): Promise<void> {
        Terminal.clear();

        if (options.length < 1) {
            Terminal.error(
                "Please provide a path where the new component should be created",
            );

            return;
        }

        let path = options[0];

        if (path.startsWith("/Components")) {
            // Noop
        } else if (path.startsWith("Components")) {
            path = `/${path}`;
        } else if (path.startsWith("/")) {
            path = `/Components${path}`;
        } else {
            path = `/Components/${path}`;
        }

        if (!path.endsWith(".stencil")) {
            path = `${path}.stencil`;
        }

        const relativePath = path;

        // Remove the first '/' so the path resolves inside the root folder
        path = path.slice(1);

        path = Path.buildPathFromRoot(path);
        const directory = Path.getDirectory(path);

        Filesystem.createDirectory(directory);
        Filesystem.writeFile(path, "");

        Terminal.write(`'${relativePath}' was created`);
    }

    async catch(): Promise<void> {}

    help(): void {
        Terminal.clear();
        Terminal.write("Usage: paper make:component <path>");
        Terminal.line();

        Terminal.write("This command creates a new component.");
        Terminal.line();

        Terminal.write("Parameters: This command has 1 parameter");
        Terminal.write(`   path  |  The path to the new component`);
    }
}
