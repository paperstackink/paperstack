import * as Filesystem from "@/Utilities/Filesystem";
import * as Path from "@/Utilities/Path";

// type Flag = {
//     name: string;
//     aliases: string[];
//     required: boolean;
// };

// type Flags = {
//     [name: string]: Flag;
// };

// type Parameter = {
//     key: string;
//     required: boolean;
//     default: string;
// };

// type Parameters = {
//     [name: string]: Parameter;
// };
//

export default class Build {
    static command = "build";
    static description = "Build project";
    // static flags: Flags = [];
    // static parameters: Parameters = [];

    static async handle() {
        const rootDirectory = Filesystem.getCurrentDirectory();
        const pagesDirectory = Path.buildPath(rootDirectory, "Pages");
        const outputDirectory = Path.buildPath(rootDirectory, "Output");
        const pages = await Filesystem.files(pagesDirectory);

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

        pagesMappedToOutput.forEach(async page => {
            await Filesystem.createDirectory(page.directory);

            await Filesystem.writeFile(page.path, page.contents);
        });
    }
    static async catch() {}
}
