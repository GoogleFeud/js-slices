
import { MutableArraySlice } from "./MutableArraySlice";

export class ImmutableArraySlice<T> extends MutableArraySlice<T> {
    constructor(arr: T[], start?: number, end?: number) {
        super(arr, start, end);
        return new Proxy(this, {
            set: (_target, prop) => {
                if (typeof prop !== "symbol") throw new Error("Can't change value of array item inside immutable array slice.");
                return Reflect.get(_target, prop);
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    push(..._vals: T[]) : number {
        throw new Error("Cannot push to immutable slice!");
    }
}