import { build } from "esbuild";
// import alias from "esbuild-plugin-path-alias";
// import { copy } from "esbuild-plugin-copy";
import path from "path";

build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: ["node10.4"],
    outdir: "dist",
    plugins: [
        // alias({
        //     "@": path.resolve(__dirname, "../src"),
        // }),
        // copy({
        //     resolveFrom: "cwd",
        //     assets: {
        //         from: ["./@types/*"],
        //         to: ["./_dist"],
        //     },
        // }),
    ],
});
