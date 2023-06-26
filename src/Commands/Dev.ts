import * as Terminal from "@/Utilities/Terminal";
import * as Path from "@/Utilities/Path";
import { Command } from "@/Commands/Command";
import Build from "@/Commands/Build";
import { ChildProcess, exec } from "child_process";
import chokidar from "chokidar";
import { isFinite } from "lodash";

async function startServer(port: string) {
    await new Build().handle({ output: false });

    return exec(`./node_modules/.bin/http-server Output --port ${port} -c-1`);
}

function logReadyMessage(port: string) {
    const url = port === "80" ? `http://localhost` : `http://localhost:${port}`;

    Terminal.write(`Your site is ready at ${url}`);
}

type Options = {
    arguments: string[];
};

export default class Dev extends Command {
    static command = "dev";
    static description = "Run a dev server";

    async handle(options: Options): Promise<void> {
        Terminal.clear();
        Terminal.write("Starting dev server...");

        let port = "8080";
        const portFlagArgumentPosition = options.arguments.findIndex(argument =>
            ["--port", "-p", "-P"].includes(argument),
        );

        if (portFlagArgumentPosition !== -1) {
            const portValue = options.arguments[portFlagArgumentPosition + 1];

            if (portValue && isFinite(Number(portValue))) {
                port = portValue;
            }
        }

        const paths = [
            Path.getAssetsDirectory(),
            Path.getPagesDirectory(),
            Path.getConfigDirectory(),
            Path.getComponentsDirectory(),
        ];
        const watcher = chokidar.watch(paths, {
            persistent: true,
            disableGlobbing: true,
        });

        let ready = false;
        let process: null | ChildProcess = null;

        watcher.on("ready", async () => {
            ready = true;

            process = await startServer(port);
            logReadyMessage(port);
        });

        watcher.on("all", async () => {
            if (ready) {
                if (process) {
                    process.kill();
                }

                Terminal.write("Restarting server...");

                process = await startServer(port);
                logReadyMessage(port);
            }
        });
    }

    async catch(): Promise<void> {}

    help(): void {
        Terminal.clear();
        Terminal.write("Usage: paper build [--port <port>]");
        Terminal.line();

        Terminal.write(
            "This command builds your site and starts a development server. It will automatically rebuild your project when you make a change.",
        );
        Terminal.line();

        Terminal.write("Options:");
        Terminal.write(
            `   --port  |  The port to use for the development server`,
        );
        Terminal.line();

        Terminal.write(
            "Note: This command should be run from the root of your project",
        );
    }
}
