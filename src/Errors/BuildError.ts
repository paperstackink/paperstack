export abstract class BuildError extends Error {
    protected abstract output: string;
}
