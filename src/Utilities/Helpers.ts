import { isPlainObject } from "lodash";

type Value = null | string | number | Map<string, Value> | PlainObject;

type PlainObject = {
    [key: string]: Value;
};

export function mapFromObject(object: PlainObject): Map<string, Value> {
    let entries = Object.entries(object);

    entries = entries.map(entry => {
        if (!isPlainObject(entry[1])) {
            return entry;
        }

        return [entry[0], mapFromObject(entry[1] as PlainObject)];
    });

    return new Map(entries);
}
