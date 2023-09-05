import objectHash from "object-hash";

export class ObjectCache 
{
    cache: { [key: string]: any };
    useHash: boolean;

    constructor(useHash: boolean)
    {
        this.cache = {};
        this.useHash = useHash;
    }

    cacheValue(key: objectHash.NotUndefined, value: objectHash.NotUndefined): void
    {
        this.cache[this.useHash ? objectHash(key) : String(key)] = value;
    }

    deleteValue(key: objectHash.NotUndefined): void
    {
        delete this.cache[this.useHash ? objectHash(key) : String(key)];
    }

    getValue(key: objectHash.NotUndefined): any
    {
        return this.cache[this.useHash ? objectHash(key) : String(key)];
    }

    isCached(key: objectHash.NotUndefined): boolean
    {
        return (this.useHash ? objectHash(key) : String(key)) in this.cache;
    }

    invalidate(cleanupFunction?: (key: objectHash.NotUndefined, value: any) => void): void
    {
        if (cleanupFunction)
        {
            Object.entries(this.cache).forEach(([key, value]) => cleanupFunction(key as objectHash.NotUndefined, value));
        }
        this.cache = {};
    }
}
