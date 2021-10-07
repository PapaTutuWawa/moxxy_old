import * as XMPP from "stanza";
import RNFS from "react-native-fs";
import { getAvatar } from "../xmpp/avatar";
import { EventEmitter } from "events";
import Maybe from "./types/maybe";

const AVATAR_CACHE_PATH = RNFS.CachesDirectoryPath + "/avatars/";

// TODO: Cache that a user has no avatar
export class AvatarCache extends EventEmitter {
    private cache: {[bareJid: string]: string};
    private requestsRunning: {[barreJid: string]: boolean};
    private isInitialized: boolean;

    constructor() {
        super();

        this.isInitialized = false;
        this.requestsRunning = {};
        this.cache = {};
    }

    public loadAvatars = async () => {
        let avatars = [];
        try {
            avatars = await RNFS.readDir(AVATAR_CACHE_PATH);
        } catch (e) {
            // TODO: Check this
            // The folder probably does not exist
            await RNFS.mkdir(AVATAR_CACHE_PATH);
            this.isInitialized = true;
            return;
        }
        
        for (const avatar of avatars) {
            this.cache[avatar.name] = avatar.path;
        }
        this.isInitialized = true;
    }

    public setAvatar = async (data: string, bareJid: string) => {
        if (!this.isInitialized)
            await this.loadAvatars();

        // TODO: Input sanitation?
        const path = AVATAR_CACHE_PATH + bareJid;
        await RNFS.writeFile(path, data, "base64");

        this.cache[bareJid] = path;
        this.emit("avatarSaved", { jid: bareJid, path: path });
        return path;
    }

    public hasRunningRequest = (bareJid: string) => {
        return bareJid in this.requestsRunning;
    }

    public getAvatar = async (client: XMPP.Agent, bareJid: string): Promise<Maybe<string>> => {
        if (!this.isInitialized)
            await this.loadAvatars();

        if (bareJid in this.cache)
            return new Maybe(this.cache[bareJid]);
        
        // TODO: Only request when we don't have it saved.
        // First we request it.
        this.requestsRunning[bareJid] = true;
        const data = await getAvatar(client, bareJid);
        if (!data) {
            delete this.requestsRunning[bareJid];
            return new Maybe();
        }
        delete this.requestsRunning[bareJid];
        
        return new Maybe(await this.setAvatar(data.getValue().toString(), bareJid));
    }
};