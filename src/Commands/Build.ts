import * as Path from "@/Utilities/Path";
import * as Terminal from "@/Utilities/Terminal";
import * as Filesystem from "@/Utilities/Filesystem";
import { Command } from "@/Commands/Command";

import { compile } from "@paperstack/stencil";

type Options = {
    output?: boolean;
};

export default class Build extends Command {
    static command = "build";
    static description = "Build project";

    async handle({ output = true }: Options): Promise<void> {
        const pagesDirectory = Path.getPagesDirectory();
        const assetsDirectory = Path.getAssetsDirectory();
        const componentsDirectory = Path.getComponentsDirectory();
        const outputDirectory = Path.getOutputDirectory();
        const pages = await Filesystem.files(pagesDirectory);

        const pagesDirectoryExists = await Filesystem.exists(pagesDirectory);
        const componentsDirectoryExists = await Filesystem.exists(
            componentsDirectory,
        );

        if (!pagesDirectoryExists) {
            throw new Error(
                "This directory contains no 'Pages' directory. Are you sure you are in the root of the project?",
            );
        }

        if (!componentsDirectoryExists) {
            throw new Error(
                "This directory contains no 'Components' directory. Are you sure you are in the root of the project?",
            );
        }

        await Filesystem.removeDirectory(outputDirectory);
        await Filesystem.createDirectory(outputDirectory);

        const pagesMappedToOutput = pages.map(file => {
            const outputPath =
                file.name === "Index"
                    ? file.directory
                    : Path.buildPath(file.directory, file.name);

            const relativePath = Path.slugify(
                Path.subtract(outputPath, pagesDirectory),
            );

            const directory = Path.concatenate(outputDirectory, relativePath);
            const name = "index";
            const path = Path.buildPath(
                directory,
                Path.buildFileName(name, "html"),
            );

            return {
                ...file,
                directory,
                path,
                name,
                type: "html" as "html",
            };
        });

        const componentFiles = await Filesystem.files(componentsDirectory);
        const components = Object.fromEntries(
            componentFiles.map(file => {
                return [file.name, file.contents];
            }),
        );

        if (output) {
            Terminal.clear();
            Terminal.write("Building site...");
            Terminal.line();
        }

        const promises = pagesMappedToOutput.map(async page => {
            await Filesystem.createDirectory(page.directory);

            const compiledContents = await compile(page.contents, {
                components,
            });

            await Filesystem.writeFile(page.path, compiledContents);

            if (output) {
                Terminal.write("✓", page.path);
            }
        });

        await Promise.all(promises);

        await Filesystem.copyDirectoryContents(
            assetsDirectory,
            outputDirectory,
        );

        Terminal.write("✓", "Copied assets");

        if (output) {
            Terminal.line();
            Terminal.write("Build completed");
        }
    }

    async catch(): Promise<void> {}

    help(): void {
        Terminal.clear();
        Terminal.write("Usage: paper build");
        Terminal.line();

        Terminal.write(
            "This command builds a production-ready version of your site. The files are placed in 'Output'.",
        );
        Terminal.line();

        Terminal.write("Options: This command has no options");
        Terminal.line();

        Terminal.write(
            "Note: This command should be run from the root of your project",
        );
    }
}
