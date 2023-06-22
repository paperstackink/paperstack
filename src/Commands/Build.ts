import * as Filesystem from "@/Utilities/Filesystem";
import * as Path from "@/Utilities/Path";
import { compile } from "@paperstack/stencil";

export default class Build {
    static command = "build";
    static description = "Build project";

    static async handle() {
        const rootDirectory = Filesystem.getCurrentDirectory();
        const pagesDirectory = Path.buildPath(rootDirectory, "Pages");
        const componentsDirectory = Path.buildPath(rootDirectory, "Components");
        const outputDirectory = Path.buildPath(rootDirectory, "Output");
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

        pagesMappedToOutput.forEach(async page => {
            await Filesystem.createDirectory(page.directory);

            const compiledContents = await compile(page.contents, {
                components,
            });

            await Filesystem.writeFile(page.path, compiledContents);
        });
    }
    static async catch() {}
}
