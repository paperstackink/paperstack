// import * as Terminal from "@/Utilities/Terminal";

// type Flag = {
//     name: string;
//     aliases: string[];
//     required: boolean;
// };

// type Flags = {
//     [name: string]: Flag;
// };

// type Parameter = {
//     key: string;
//     required: boolean;
//     default: string;
// };

// type Parameters = {
//     [name: string]: Parameter;
// };

export default class Build {
    static command = "build";
    static description = "Build project";
    // static flags: Flags = [];
    // static parameters: Parameters = [];

    static async handle() {
        console.log("BUILD");
    }
    static async catch() {}
}
