import * as Path from "@/Utilities/Path";
import * as Terminal from "@/Utilities/Terminal";
import * as Filesystem from "@/Utilities/Filesystem";
import fs from "node:fs/promises";
import { Command } from "@/Commands/Command";
import { cosmiconfig } from "cosmiconfig";

import { compile, extractData, CompilationError } from "@paperstack/stencil";

import { ReservedComponentName } from "@/Errors/ReservedComponentName";
import { DuplicateComponentName } from "@/Errors/DuplicateComponentName";
import { DuplicatePagesFromExtensionError } from "@/Errors/DuplicatePagesFromExtensionError";
import { DuplicatePagesFromFileAndFolderError } from "@/Errors/DuplicatePagesFromFileAndFolderError";

declare global {
    interface Map<K, V> {
        map<T>(predicate: (key: K, value: V) => T): Map<V, T>;
    }
}

Map.prototype.map = function <K, V, T>(
    predicate: (value: V, key: K) => T,
): Map<K, T> {
    let map: Map<K, T> = new Map();

    this.forEach((value: V, key: K) => {
        map.set(key, predicate(value, key));
    });
    return map;
};

type Options = {
    output?: boolean;
    throws?: boolean;
    env?: "production" | "development";
};

type Page = {
    path: string;
    slug: string;
    name: string;
    isPage: true;
    isDirectory: false;
    nestedPath?: string;
    [key: string]: any;
};

type PageMap = Map<keyof Page, Page[keyof Page]>;

type Directory = {
    isPage: false;
    isDirectory: true;
    [key: string]: MapItem;
};

type DirectoryMap = Map<keyof Directory, Directory[keyof Directory]>;

type MapItem = PageMap | DirectoryMap | boolean;

type Environment = {
    [key: string]: any;
};

type MarkdownConfig = {
    linkHeadlines: null | "wrap" | "after" | "append" | "before" | "prepend";
};

type Config = {
    markdown?: MarkdownConfig;
    [key: string]: any;
};

export default class Build extends Command {
    static command = "build";
    static description = "Build project";

    async handle({
        output: providedOutput = true,
        throws = false,
        env = "production",
    }: Options): Promise<void> {
        try {
            let output = providedOutput;
            const pagesDirectory = Path.getPagesDirectory();
            const assetsDirectory = Path.getAssetsDirectory();
            const componentsDirectory = Path.getComponentsDirectory();
            const outputDirectory = Path.getOutputDirectory();
            const configDirectory = Path.getConfigDirectory();

            const pagesDirectoryExists = await Filesystem.exists(
                pagesDirectory,
            );
            const componentsDirectoryExists = await Filesystem.exists(
                componentsDirectory,
            );

            if (!pagesDirectoryExists) {
                throw new Error(
                    "This directory contains no 'Pages' directory. Are you sure you are in the root of the project?",
                );
            }

            if (!componentsDirectoryExists) {
                throw new Error(
                    "This directory contains no 'Components' directory. Are you sure you are in the root of the project?",
                );
            }

            const pages = await Filesystem.files(pagesDirectory);

            await Filesystem.removeDirectory(outputDirectory);
            await Filesystem.createDirectory(outputDirectory);

            const pagesMappedToOutput = pages.map(file => {
                const outputPath =
                    file.name === "Index"
                        ? file.directory
                        : Path.buildPath(file.directory, file.name);

                const relativePath = Path.slugify(
                    Path.subtract(outputPath, pagesDirectory),
                );

                const directory = Path.concatenate(
                    outputDirectory,
                    relativePath,
                );
                const name = "index";
                const path = Path.buildPath(
                    directory,
                    Path.buildFileName(name, "html"),
                );
                const fileExtension = Path.getExtension(file.path);
                const sourceType =
                    fileExtension === "stencil" ? "stencil" : "markdown";
                const sourceFile = Path.subtract(
                    file.path,
                    pagesDirectory,
                    ".",
                    fileExtension,
                );
                const urlPath = Path.subtract(
                    path,
                    outputDirectory,
                    "index.html",
                );

                return {
                    ...file,
                    sourceType,
                    sourceFile,
                    sourceFileExtension: fileExtension,
                    directory,
                    path,
                    name,
                    urlPath,
                    type: "html" as "html",
                };
            });

            // Check whether there are files + folders that will result in duplicate pages
            // I.e. Pages/Articles.stencil and Pages/Articles/Index.md
            pagesMappedToOutput.forEach((page, index) => {
                if (page.sourceFile.endsWith("Index")) {
                    return;
                }

                const conflict = pagesMappedToOutput.find(
                    (other, otherIndex) => {
                        const isIndexSourceFile =
                            other.sourceFile === `${page.sourceFile}/Index`;

                        return isIndexSourceFile && index !== otherIndex;
                    },
                );

                if (conflict) {
                    throw new DuplicatePagesFromFileAndFolderError(
                        page.urlPath,
                        `Pages${page.sourceFile}.${page.sourceFileExtension}`,
                        `Pages${conflict.sourceFile}.${conflict.sourceFileExtension}`,
                    );
                }
            });

            // Check whether there are pages with the same name but different suffix
            // I.e. Index.md, Index.mds and Index.stencil
            const duplicatePages = pagesMappedToOutput.filter((page, index) =>
                pagesMappedToOutput.some((other, otherIndex) => {
                    return page.path === other.path && index !== otherIndex;
                }),
            );
            if (duplicatePages.length) {
                // Make sure we're only working with 1 set of duplicate pages
                let pages = duplicatePages.filter(
                    page => page.path === duplicatePages[0].path,
                );

                throw new DuplicatePagesFromExtensionError(
                    pages[0].urlPath,
                    pages.map(
                        page =>
                            `Pages${page.sourceFile}.${page.sourceFileExtension}`,
                    ),
                );
            }

            const componentFiles = await Filesystem.files(componentsDirectory);

            const componentsWithReservedNames = componentFiles.filter(file =>
                ["Component", "Data"].includes(file.name),
            );
            if (componentsWithReservedNames.length) {
                throw new ReservedComponentName(
                    componentsWithReservedNames[0].name,
                    Path.getRelativePath(componentsWithReservedNames[0].path),
                );
            }

            const duplicateComponents = componentFiles.filter(
                (component, index) =>
                    componentFiles.some((other, otherIndex) => {
                        return (
                            component.name === other.name &&
                            index !== otherIndex
                        );
                    }),
            );

            if (duplicateComponents.length) {
                throw new DuplicateComponentName(
                    duplicateComponents[0].name,
                    duplicateComponents.map(component =>
                        Path.getRelativePath(component.path),
                    ),
                );
            }
            const components = Object.fromEntries(
                componentFiles.map(file => {
                    return [file.name, file.contents];
                }),
            );

            if (output) {
                Terminal.clear();
                Terminal.write("Building site...");
                Terminal.line();
            }

            let $scope = new Map();

            let pagesObjectArrayPromises: Promise<PageMap>[] =
                pagesMappedToOutput.map(async item => {
                    const path = Path.subtract(
                        item.path,
                        outputDirectory,
                        "index.html",
                    );
                    const slug =
                        path
                            .split("/")
                            .filter(piece => piece)
                            .pop() || "";
                    const name = item.sourceFile.split("/").pop();
                    const nestedPath = item.sourceFile
                        .replace("/", "")
                        .replaceAll("/", ".");

                    const data: PageMap = await extractData(item.contents, {
                        language: item.sourceType,
                        path: `Pages/${nestedPath}.${item.sourceFileExtension}`,
                    });
                    const page = new Map([...data]);

                    page.set("path", path);
                    page.set("slug", slug);
                    page.set("name", name);
                    page.set("isPage", true);
                    page.set("isDirectory", false);
                    page.set("nestedPath", nestedPath);
                    page.set("$data", data);

                    return page;
                });

            let pagesObjectArray: PageMap[] = await Promise.all(
                pagesObjectArrayPromises,
            );

            let $pages = new Map();

            $pages.set("isPage", false);
            $pages.set("isDirectory", true);

            function set(
                map: DirectoryMap,
                key: string,
                page: PageMap,
            ): DirectoryMap {
                if (!key.includes(".")) {
                    map.set(key, page);

                    return map;
                }

                const newMapKey = key.split(".").shift()!;

                if (!map.has(newMapKey)) {
                    const newMap = new Map();
                    const newNestedKey = key.replace(`${newMapKey}.`, "");

                    newMap.set("isPage", false);
                    newMap.set("isDirectory", true);

                    map.set(newMapKey, set(newMap, newNestedKey, page));

                    return map;
                } else {
                    const newMap = map.get(newMapKey)! as DirectoryMap;
                    const newNestedKey = key.replace(`${newMapKey}.`, "");

                    map.set(newMapKey, set(newMap, newNestedKey, page));

                    return map;
                }
            }

            pagesObjectArray.forEach(page => {
                const nestedPath = page.get("nestedPath");
                page.delete("nestedPath");

                if (typeof nestedPath === "string") {
                    $pages = set($pages, nestedPath, page);
                }
            });

            function getSubRecords(directory: DirectoryMap) {
                let pages = new Map();
                let allPages = new Map();
                let directories = new Map();
                let allDirectories = new Map();

                for (const entry of directory.entries()) {
                    const key = entry[0];
                    const value = entry[1];

                    if (!(value instanceof Map)) {
                        continue;
                    }

                    if (value.get("isPage")) {
                        pages.set(key, value);
                        allPages.set(key, value);
                    }

                    if (value.get("isDirectory")) {
                        directories.set(key, value);
                        allDirectories.set(key, value);

                        const {
                            allPages: nestedAllPages,
                            allDirectories: nestedAllDirectories,
                        } = getSubRecords(value as DirectoryMap);

                        for (const nestedPageEntry of nestedAllPages) {
                            allPages.set(
                                `${key}.${nestedPageEntry[0]}`,
                                nestedPageEntry[1],
                            );
                        }

                        for (const nestedDirectoryEntry of nestedAllDirectories) {
                            allDirectories.set(
                                `${key}.${nestedDirectoryEntry[0]}`,
                                nestedDirectoryEntry[1],
                            );
                        }
                    }
                }

                return { pages, allPages, directories, allDirectories };
            }

            function setSubRecordsForEntry(map: any, key: string) {
                if (!(map instanceof Map)) {
                    return map;
                }

                if (!map.get("isDirectory")) {
                    return map;
                }

                map.map(setSubRecordsForEntry);

                const { pages, allPages, directories, allDirectories } =
                    getSubRecords(map);

                map.set("pages", pages);
                map.set("allPages", allPages);
                map.set("directories", directories);
                map.set("allDirectories", allDirectories);

                return map;
            }

            $pages = $pages.map(setSubRecordsForEntry);

            const {
                pages: pagesAlt,
                allPages,
                directories,
                allDirectories,
            } = getSubRecords($pages);

            $pages.set("pages", pagesAlt);
            $pages.set("allPages", allPages);
            $pages.set("directories", directories);
            $pages.set("allDirectories", allDirectories);

            $scope.set("$pages", $pages);

            function get(map: DirectoryMap, key: string) {
                if (!key.includes(".")) {
                    return map.get(key);
                }

                const [firstKey, ...remainingKeys] = key.split(".");

                if (!map.has(firstKey)) {
                    return null;
                }

                const newMap = map.get(firstKey)! as DirectoryMap;
                const newKey = remainingKeys.join(".");

                return get(newMap, newKey);
            }

            const configFiles = await fs.readdir(configDirectory);
            let config: Config = {};

            const configPromises = configFiles.map(async file => {
                const name = file.replace(".js", "").toLowerCase();
                const path = Path.buildPath(configDirectory, file);
                const explorer = cosmiconfig(name);
                const loaded = await explorer.load(path);

                if (loaded) {
                    config[name] = loaded.config;
                }
            });

            await Promise.all(configPromises);

            const promises = pagesMappedToOutput.map(async page => {
                await Filesystem.createDirectory(page.directory);

                const nestedPath = page.sourceFile
                    .replace("/", "")
                    .replaceAll("/", ".");

                const $page = get($pages, nestedPath)! as DirectoryMap;

                $scope.set("$page", $page);

                const environment: Environment = {
                    environment: env,
                    $page: $page,
                    $pages: $pages,
                };

                $page.forEach((value, key) => {
                    environment[key] = value;
                });

                const compiledContents = await compile(
                    page.contents,
                    {
                        config,
                        components,
                        environment: { global: environment },
                    },
                    {
                        language: page.sourceType,
                        path: `Pages/${nestedPath}.${page.sourceFileExtension}`,
                    },
                );

                await Filesystem.writeFile(page.path, compiledContents);

                if (output) {
                    Terminal.write("✓", page.path);
                }
            });

            await Promise.all(promises);

            await Filesystem.copyDirectoryContents(
                assetsDirectory,
                outputDirectory,
            );

            if (output) {
                Terminal.write("✓", "Copied assets");
            }

            if (output) {
                Terminal.line();
                Terminal.write("Build completed");
            }
        } catch (error: any) {
            if (!error.output) {
                throw error;
            }

            console.error(error.output);

            throw error;
        }
    }

    async catch(): Promise<void> {}

    help(): void {
        Terminal.clear();
        Terminal.write("Usage: paper build");
        Terminal.line();

        Terminal.write(
            "This command builds a production-ready version of your site. The files are placed in 'Output'.",
        );
        Terminal.line();

        Terminal.write("Options: This command has no options");
    }
}
