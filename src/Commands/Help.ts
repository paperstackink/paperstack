import * as Terminal from "@/Utilities/Terminal";
import { Command } from "@/Commands/Command";

export default class Help extends Command {
    static command = "help";
    static description = "Information about the CLI tool";

    async handle(): Promise<void> {
        Terminal.clear();
        Terminal.write("Paperstack");
        Terminal.line();

        Terminal.write(
            "Paperstack is a static site generator. See more at http://paperstack.ink",
        );
        Terminal.line();

        Terminal.write("Available commands:");
        Terminal.write(`   paper dev     |  Start a development server`);
        Terminal.write(`   paper build   |  Build the site for production`);
        Terminal.write(`   paper create  |  Create a new project`);
        Terminal.line();

        Terminal.write(
            "Note: It's important that you run 'dev' and 'build' from the root of your project",
        );
    }

    async catch(): Promise<void> {}

    help(): void {
        // If the 'help' command is run with a '--help' flag we just wanna do the same as the default command does
        this.handle();
    }
}
