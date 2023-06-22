export abstract class Command {
    static command: string;
    static description: string;

    abstract handle(): Promise<void>;
    abstract catch(): Promise<void>;
    abstract help(): void;
}
