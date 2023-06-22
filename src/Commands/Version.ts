import * as Terminal from "@/Utilities/Terminal";
import { Command } from "@/Commands/Command";
import packageDefinition from "@/../package.json";

export default class Help extends Command {
    static command = "version";
    static description = "The version of Paperstack being used";

    async handle(): Promise<void> {
        Terminal.clear();
        Terminal.write(packageDefinition.version);
    }

    async catch(): Promise<void> {}

    help(): void {}
}
