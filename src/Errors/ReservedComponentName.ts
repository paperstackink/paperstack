import { BuildError } from "@/Errors/BuildError";
import { match } from "@/Utilities/Helpers";

export class ReservedComponentName extends BuildError {
    protected output: string;

    constructor(component: string, path: string) {
        super();

        Object.setPrototypeOf(this, ReservedComponentName.prototype);
        this.name = "ReservedComponentName";
        this.output = this.format(component, path);
    }

    format(component: string, path: string): string {
        const explanation = match(component, {
            Data: `"<Data>" is used to add extra data to a page with Yaml:`,
            Component: `"<Component>" is used to dynamically render another component:`,
        });
        const example = match(component, {
            Data: `     1 |   <Data>
     2 |       title: Value, Price and Profit
     3 |       featured: true
     4 |   </Data>
`,
            Component: `     1 |   <Component is="{{ $name }}" />`,
        });

        return `-----  Error: Reserved component name  ----------------------

You have a custom component called "${component}", but that is a reserved name.

${explanation}
${example}

The component is located at "${path}".
`;
    }
}
