import { EventEmitter } from "events";

// TODO: Write this into the database
export default class DiscoCache extends EventEmitter {
    private features: {[jid: string]: string[]};

    constructor() {
        super();

        this.features = {};
    }

    public setFeatures = (jid: string, features: string[]) => {
        this.features[jid] = features;

        this.emit("featuresDiscovered", jid);
    }

    /**
     * Returns true if we have the namespace in our cache
     */
    public supportsNamespace = (jid: string, namespace: string) => {
        if (jid in this.features)
            return this.features[jid].indexOf(namespace) !== -1; 
        
        return false;
    }
};