import * as Path from "@/Utilities/Path";
import * as Strings from "@/Utilities/Strings";
import * as Terminal from "@/Utilities/Terminal";
import * as Filesystem from "@/Utilities/Filesystem";
import { Command } from "@/Commands/Command";

export default class MakePage extends Command {
    static command = "make:page";
    static description = "Create a new page";

    async handle({ options }: { options: string[] }): Promise<void> {
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

        const isMarkdown = options.some(piece => piece.includes("--markdown"));

        if (
            ![".stencil", ".markdown", ".md", ".mds"].some(extension =>
                path.endsWith(extension),
            )
        ) {
            const extension = isMarkdown ? "mds" : "stencil";
            path = `${path}.${extension}`;
        }

        const relativePath = path;

        // Remove the first '/' so the path resolves inside the root folder
        path = path.slice(1);

        path = Path.buildPathFromRoot(path);

        if (await Filesystem.exists(path)) {
            Terminal.error(`'${relativePath}' already exists`);

            return;
        }

        const layout = this.getLayout(options);
        const content = isMarkdown
            ? this.getMarkdownContent(layout)
            : this.getStencilContent(layout);

        const directory = Path.getDirectory(path);

        Filesystem.createDirectory(directory);
        Filesystem.writeFile(path, content);

        Terminal.write(`'${relativePath}' was created`);
    }

    async catch(): Promise<void> {}

    help(): void {
        Terminal.write("Usage: paper make:page <path>");
        Terminal.line();

        Terminal.write("This command creates a new page.");
        Terminal.line();

        Terminal.write("Parameters: This command has 1 parameter");
        Terminal.write(
            `   path  |  The path to the new page or the URL of the new page`,
        );

        Terminal.line();

        Terminal.write("Flags: This command has 2 flags");
        Terminal.write(
            `   --layout    |  Includes the layout in the generated page`,
        );
        Terminal.write(`   --markdown  |  Makes the new page a markdown page`);

        Terminal.line();

        Terminal.write("Examples: ");
        Terminal.write(`   paper make:page /articles/how-to`);
        Terminal.write(`   paper make:page Articles/HowTo`);
        Terminal.write(`   paper make:page Articles/HowTo --layout=BaseLayout`);
        Terminal.write(`   paper make:page Articles/HowTo --markdown`);
    }

    getLayout(options: string[]): string | null {
        if (!options.some(piece => piece.includes("--layout"))) {
            return null;
        }

        const layoutFlagIndex = options.findIndex(piece =>
            piece.includes("--layout"),
        );

        let layout = "";

        if (options[layoutFlagIndex].includes("=")) {
            layout = Strings.after(options[layoutFlagIndex], "=");
        } else if (options.length >= layoutFlagIndex + 1) {
            layout = options[layoutFlagIndex + 1];
        }

        return layout || null;
    }

    getLayoutContent(layout: string): string {
        return `<${layout}>\n    \n</${layout}>`;
    }

    getMarkdownContent(layout: string | null): string {
        return `---
template: ${layout || "Base"}
---

`;
    }

    getStencilContent(layout: string | null): string {
        if (!layout) {
            return "";
        }

        return this.getLayoutContent(layout);
    }
}
