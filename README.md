# js-slices

Javascript slices. Create mutabe and immutable slices which are faster than the `Array#slice` method and take less memory.

## Mutable slices

```js
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const slice = new MutableArraySlice(arr, 5, 9); // [6, 7, 8, 9]

slice[0] = 100;
console.log(arr[5]); // 100
console.log(slice[0]); // 100
```

The `MutableArraySlice` and `ImmutableArraySlice` have most array methods, but they **do not** create a new array! 

Modifying index elements of the slices also modifiers the ones in the original array, unless you use the `ImmutableArraySlice` class which errors when you try to change an element.