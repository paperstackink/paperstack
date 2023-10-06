import { BuildError } from "@/Errors/BuildError";

export class DuplicatePagesFromFileAndFolderError extends BuildError {
    protected output: string;

    constructor(url: string, ...files: string[]) {
        super();

        Object.setPrototypeOf(
            this,
            DuplicatePagesFromFileAndFolderError.prototype,
        );
        this.name = "DuplicatePagesFromFileAndFolderError";
        this.output = this.format(url, files);
    }

    format(url: string, files: string[]): string {
        const list = files.map(file => `     -  ${file}`).join("\n");

        return `-----  Error: Duplicate pages  ----------------------

You have multiple pages with the url "${url}".

The pages are located here:
${list}

This error occured because there was a conflict between a named page and an index page during compilation:

  Pages with the name "Index" will use the path of the folder it's in:
       -  "Pages/Articles/Index.stencil" compiles to "Output/articles/index.html" and has the path "/articles/"

  Pages with any other name will be placed inside a new folder named after the file and the file will be renamed to "Index":
       -  "Pages/Articles.stencil" compiles to "Output/articles/index.html" and has the path "/articles/"
`;
    }
}
