import { ImmutableArraySlice } from ".";

export class MutableArraySlice<T> {
    [key: number] : T,
    start: number
    end: number
    private array: T[]
    constructor(arr: T[], start?: number, end?: number) {
        this.array = arr;
        if (start !== undefined) {
            if (start < 0) this.start = arr.length + start;
            else if (start > arr.length) this.start = arr.length;
            else this.start = start;
        } else this.start = 0;
        if (end !== undefined) {
            if (end < 0) this.end = arr.length + end;
            else if (end > arr.length) this.end = arr.length;
            else this.end = end;
        } else this.end = arr.length;
        return new Proxy(this, {
            set: (_target, prop, val) => {
                if (typeof prop !== "symbol") {
                    const num = +prop;
                    if (!isNaN(num)) return this.array[this.start + num] = val;
                }
                return Reflect.set(_target, prop, val);
            },
            get: (_target, prop) => {
                if (typeof prop !== "symbol") {
                    const num = +prop;
                    if (!isNaN(num)) return this.array[this.start + num];
                }
                return Reflect.get(_target, prop);
            }
        });
    }

    *[Symbol.iterator]() : Generator<T> {
        for (let i=this.start; i < this.end; i++) {
            yield this.array[i];
        }
    }

    at(index: number) : T|undefined {
        return this.array[(index < 0 ? this.end : this.start) + index];
    }

    every(cb: (el: T, slice: this, originalIndex: number) => boolean) : boolean {
        const arr = this.array, end = this.end;
        for (let i=this.start; i < end; i++) if (!cb(arr[i], this, i)) return false;
        return true;
    }

    some(cb: (el: T, slice: this, originalIndex: number) => boolean) : boolean {
        const arr = this.array, end = this.end;
        for (let i=this.start; i < end; i++) if (cb(arr[i], this, i)) return true;
        return false;
    }

    find(cb: (el: T, slice: this, originalIndex: number) => boolean) : T|undefined {
        const arr = this.array, end = this.end;
        for (let i=this.start; i < end; i++) if (cb(arr[i], this, i)) return arr[i];
    }

    filter(cb: (el: T, slice: this, originalIndex: number) => boolean) : Array<T> {
        const arr = this.array, end = this.end;
        const res = [];
        for (let i=this.start, j = 0; i < end; i++, j++) if (cb(arr[i], this, i)) res.push(arr[i]);
        return res;
    }

    map<R = unknown>(cb: (el: T, slice: this, originalIndex: number) => R) : Array<R> {
        const arr = this.array, end = this.end;
        const res = [];
        for (let i=this.start; i < end; i++) res.push(cb(arr[i], this, i));
        return res;
    }

    reduce<R = unknown>(cb: (el: T, slice: this, originalIndex: number) => R, defaultValue?: R) : R|undefined {
        const arr = this.array, end = this.end;
        let acc = defaultValue;
        for (let i=this.start; i < end; i++) acc = cb(arr[i], this, i);
        return acc;
    }

    includes(item: T) : boolean {
        const arr = this.array, end = this.end;
        for (let i=this.start; i < end; i++) if (arr[i] === item) return true;
        return false;
    }

    slice(start?: number, end?: number) : Array<T> {
        return this.array.slice(start !== undefined ? this.start + start : this.start, end !== undefined ? Math.min(this.start + end, this.end) : this.end);
    }

    sliceMut(start?: number, end?: number) : MutableArraySlice<T> {
        return new MutableArraySlice(this.array, start !== undefined ? this.start + start : this.start, end !== undefined ? Math.min(this.start + end, this.end) : this.end);
    }

    sliceImmut(start?: number, end?: number) : ImmutableArraySlice<T> {
        return new ImmutableArraySlice(this.array, start !== undefined ? this.start + start : this.start, end !== undefined ? Math.min(this.start + end, this.end) : this.end);
    }

    join(delimiter: string) : string {
        let str = "";
        const arr = this.array;
        const newEnd = this.end - 1;
        for (let i = this.start; i <= newEnd; i++) {
            str += arr[i];
            if (i !== newEnd) str += delimiter;
        } 
        return str;
    }

    forEach(cb: (el: T, slice: this, originalIndex: number) => void) : void {
        const end = this.end;
        for (let i = this.start; i < end; i++) cb(this.array[i], this, i);
    }

    push(...vals: T[]) : number {
        this.array.splice(this.end, 0, ...vals);
        return this.end += vals.length; 
    }

    toString() : string {
        return this.join(", ");
    }

    toArray() : Array<T> {
        return this.array.slice(this.start, this.end);
    }

    get length() : number {
        return this.end - this.start;
    }

    get [Symbol.toStringTag]() : string {
        return this.join(", ");
    }

}