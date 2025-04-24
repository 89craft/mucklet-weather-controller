export function storeGetBool(key: string): bool {
    return Store.getBuffer(key) != null;
}
export function storeSetBool(key: string, value: bool): void {
    console.log(`key: ${key}, value: ${value}`);
    // Room.describe(`key: ${key}, value: ${value}`);
    if (value) Store.setBuffer(key, new ArrayBuffer(1));
    else  Store.deleteKey(key);
}

// export const store = {
//     getBool: storeGetBool,
//     setBool: storeSetBool,
// }
