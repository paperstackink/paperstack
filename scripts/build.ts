import { build } from "esbuild";
import path from "path";
import fs from "fs";

const commandPaths = fs
    .readdirSync(path.resolve(__dirname, "../src/Commands"))
    .map(fileName => path.resolve(__dirname, "../src/Commands", fileName));

build({
    entryPoints: [...commandPaths],
    bundle: true,
    platform: "node",
    target: ["node10.4"],
    outdir: "dist",
});
