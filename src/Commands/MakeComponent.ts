import * as Path from "@/Utilities/Path";
import * as Terminal from "@/Utilities/Terminal";
import * as Filesystem from "@/Utilities/Filesystem";
import { Command } from "@/Commands/Command";

export default class MakeComponent extends Command {
    static command = "make:component";
    static description = "Create a new component";

    async handle({ options }: { options: string[] }): Promise<void> {
        if (options.length < 1) {
            Terminal.error(
                "Please provide a path where the new component should be created",
            );

            return;
        }

        let path = options[0];

        if (path.startsWith("/components")) {
            // Noop
        } else if (path.startsWith("components")) {
            path = `/${path}`;
        } else if (path.startsWith("/")) {
            path = `/components${path}`;
        } else {
            path = `/components/${path}`;
        }

        if (!path.endsWith(".stencil")) {
            path = `${path}.stencil`;
        }

        const name = path.split("/").pop();

        if (name && name.charAt(0) !== name.charAt(0).toUpperCase()) {
            const capitalisedName =
                name.charAt(0).toUpperCase() + name.slice(1);
            path = path.replace(name, capitalisedName);
        }

        const relativePath = path;

        // Remove the first '/' so the path resolves inside the root folder
        path = path.slice(1);

        path = Path.buildPathFromRoot(path);

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
        Terminal.write("Usage: paper make:component <path>");
        Terminal.line();

        Terminal.write("This command creates a new component.");
        Terminal.line();

        Terminal.write("Parameters: This command has 1 parameter");
        Terminal.write(`   path  |  The path to the new component`);
        Terminal.line();

        Terminal.write("Examples: ");
        Terminal.write(`   paper make:component Button`);
        Terminal.write(`   paper make:component ui/Button`);
    }
}
