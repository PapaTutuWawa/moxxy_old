import * as XMPP from "stanza";
import RNFS from "react-native-fs";
import { getAvatar } from "../xmpp/avatar";
import { EventEmitter } from "events";

const AVATAR_CACHE_PATH = RNFS.CachesDirectoryPath + "/avatars/";

// TODO: Cache that a user has no avatar
export class AvatarCache extends EventEmitter {
    private cache: {[bareJid: string]: string};
    private isInitialized: boolean;

    constructor() {
        super();

        this.isInitialized = false;
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
            avatars = await RNFS.readDir(AVATAR_CACHE_PATH);
        }
        
        for (const avatar of avatars) {
            this.cache[avatar.name] = avatar.path;
        }
        this.isInitialized = true;
    }

    public setAvatar = async (data: string, bareJid: string) => {
        // TODO: Input sanitation?
        const path = AVATAR_CACHE_PATH + bareJid;
        await RNFS.writeFile(path, data, "base64");

        this.cache[bareJid] = path;
        this.emit("avatarSaved", { jid: bareJid, path: path });
        return path;
    }

    public getAvatar = async (client: XMPP.Agent, bareJid: string): Promise<string | null> => {
        if (!this.isInitialized)
            await this.loadAvatars();

        if (bareJid in this.cache)
            return this.cache[bareJid];
        
        // TODO: Only request when we don't have it saved.
        // First we request it.
        const data = await getAvatar(client, bareJid);
        if (!data)
            return null;
        
        return await this.setAvatar(data.toString(), bareJid);
    }
};