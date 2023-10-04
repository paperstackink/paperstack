import * as Path from "@/Utilities/Path";
import * as Terminal from "@/Utilities/Terminal";
import * as Filesystem from "@/Utilities/Filesystem";
import { Command } from "@/Commands/Command";
import { ChildProcess, exec as execSync } from "child_process";
import util from "util";

const exec = util.promisify(execSync);

export default class Create extends Command {
    static command = "create";
    static description = "Create a new project";

    async handle({ options }: { options: string[] }): Promise<void> {
        Terminal.clear();

        if (options.length < 1) {
            Terminal.error(
                "Please provide a path where the new project should be created",
            );

            return;
        }

        Terminal.write("Creating new project...");

        const localPath = options[0];

        const path = Path.buildPathFromRoot(localPath);

        await exec(
            `git clone https://github.com/paperstackink/starter.git ${path}`,
        );

        const gitFolderPath = Path.buildPath(path, ".git");

        Filesystem.removeDirectory(gitFolderPath);

        await exec(`git init`, { cwd: path });
        await exec(`git add .`, { cwd: path });
        await exec(`git commit -m "Init"`, { cwd: path });

        await exec(`npm install`, { cwd: path });

        Terminal.write(`The project has been created in '${localPath}'`);
        Terminal.write(`Run 'cd ${localPath} && npm run dev' to get started`);
    }

    async catch(): Promise<void> {}

    help(): void {
        Terminal.clear();
        Terminal.write("Usage: paper create <path>");
        Terminal.line();

        Terminal.write("This command creates a new project.");
        Terminal.line();

        Terminal.write("Parameters: This command has 1 parameter");
        Terminal.write(`   path  |  The path to the new project`);
    }
}
