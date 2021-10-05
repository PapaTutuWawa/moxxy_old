export default class Maybe<T> {
    private isSet: boolean;
    constructor(private readonly value: T | undefined = undefined) {
        this.isSet = value !== undefined;
    }

    public hasValue = () => {
        return this.isSet;
    }

    public getValue = (): T | null => {
        if (!this.hasValue())
            return null;
        
        return this.value;
    }
}