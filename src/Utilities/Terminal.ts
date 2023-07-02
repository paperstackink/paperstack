export function write(...inputs: string[]): void {
    console.log(...inputs);
}

export function error(...inputs: string[]): void {
    console.log(...inputs);
}

export function clear(): void {
    console.clear();
}

export function line(): void {
    console.log();
}
