type Options = {
    [key: string]: any;
};

export abstract class Command {
    static command: string;
    static description: string;

    abstract handle(options: Options): Promise<void>;
    abstract catch(): Promise<void>;
    abstract help(): void;
}
