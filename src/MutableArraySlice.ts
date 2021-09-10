
export class MutableArraySlice<T> {
    [key: number] : T,
    start: number
    end: number
    private array: WeakRef<Array<T>>
    constructor(arr: T[], start?: number, end?: number) {
        this.array = new WeakRef(arr);
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
                    if (!isNaN(num)) return this.getOriginal()[this.start + num] = val;
                }
                return Reflect.get(_target, prop);
            },
            get: (_target, prop) => {
                if (typeof prop !== "symbol") {
                    const num = +prop;
                    if (!isNaN(num)) return this.getOriginal()[this.start + num];
                }
                return Reflect.get(_target, prop);
            }
        });
    }

    getOriginal() : Array<T> {
        const arr = this.array.deref();
        if (!arr) throw new Error("Array has been garbage collected.");
        return arr;
    }

    at(index: number) : T|undefined {
        return this.getOriginal()[(index < 0 ? this.end : this.start) + index];
    }

    every(cb: (el: T, index: number, slice: this, originalIndex: number) => boolean) : boolean {
        const arr = this.getOriginal();
        for (let i=this.start, j = 0; i < this.end; i++, j++) {
            if (!cb(arr[i], j, this, i)) return false;
        }
        return true;
    }

    some(cb: (el: T, index: number, slice: this, originalIndex: number) => boolean) : boolean {
        const arr = this.getOriginal();
        for (let i=this.start, j = 0; i < this.end; i++, j++) {
            if (cb(arr[i], j, this, i)) return true;
        }
        return false;
    }

    find(cb: (el: T, index: number, slice: this, originalIndex: number) => boolean) : T|undefined {
        const arr = this.getOriginal();
        for (let i=this.start, j = 0; i < this.end; i++, j++) {
            if (cb(arr[i], j, this, i)) return arr[i];
        }
    }

    filter(cb: (el: T, index: number, slice: this, originalIndex: number) => boolean) : Array<T> {
        const arr = this.getOriginal();
        const res = [];
        for (let i=this.start, j = 0; i < this.end; i++, j++) {
            if (cb(arr[i], j, this, i)) res.push(arr[i]);
        }
        return res;
    }

    map<R = unknown>(cb: (el: T, index: number, slice: this, originalIndex: number) => R) : Array<R> {
        const arr = this.getOriginal();
        const res = [];
        for (let i=this.start, j = 0; i < this.end; i++, j++) res.push(cb(arr[i], j, this, i));
        return res;
    }

    reduce<R = unknown>(cb: (el: T, index: number, slice: this, originalIndex: number) => R, defaultValue?: R) : R|undefined {
        const arr = this.getOriginal();
        let acc = defaultValue;
        for (let i=this.start, j = 0; i < this.end; i++, j++) acc = cb(arr[i], j, this, i);
        return acc;
    }

    includes(item: T) : boolean {
        const arr = this.getOriginal();
        for (let i=this.start; i < this.end; i++) {
            if (arr[i] === item) return true;
        }
        return false;
    }

    slice(start?: number, end?: number) : Array<T> {
        return this.getOriginal().slice(start !== undefined ? this.start + start : this.start, end !== undefined ? this.end - end : this.end);
    }

    sliceMut(start?: number, end?: number) : MutableArraySlice<T> {
        return new MutableArraySlice(this.getOriginal(), start !== undefined ? this.start + start : this.start, end !== undefined ? this.end - end : this.end);
    }

    join(delimiter: string) : string {
        let str = "";
        const arr = this.getOriginal();
        const newEnd = this.end - 1;
        for (let i=this.start; i <= newEnd; i++) {
            str += arr[i];
            if (i !== newEnd) str += delimiter;
        } 
        return str;
    }

    toString() : string {
        return this.join(", ");
    }

}