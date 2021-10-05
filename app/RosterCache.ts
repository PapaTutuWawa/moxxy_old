import { EventEmitter } from "events";
import RosterItem from "./storage/rosteritem";
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as XMPP from "stanza";
import { AvatarCache } from "./AvatarCache";

// TODO: Don't request the avatars in getRoster to prevent blocking the roster loading
export default class RosterCache extends EventEmitter {
    private cache: {[jid: string]: RosterItem};
    private loaded: boolean;

    constructor(private avatarCache: AvatarCache, private client: XMPP.Agent) {
        super();

        this.cache = {};
        this.loaded = false;
    }

    public setRoster = async (items: XMPP.Stanzas.RosterItem[]) => {
        const rosterItems: RosterItem[] = items.map(item => ({
            jid: item.jid,
            nickname: item.name ? item.name : undefined,
            avatarUrl: ""
        }));

        await AsyncStorage.setItem("account_roster", JSON.stringify(rosterItems));

        this.emit("rosterSet", rosterItems);
    }

    /**
     * Returns true if @jid is in the roster. Assumes that the function is called after
     * getRoster or setRoster has been called at least once.
     * */
    public inRoster = (jid: string) => {
        return jid in this.cache;
    }

    // TODO: Check if in roster
    public getRosterItem = async (bareJid: string): Promise<RosterItem> => {
        if (!this.loaded)
            await this.getRoster();

        return this.cache[bareJid];
    }

    public updateRosterItemAvatarUrl = async (bareJid: string, avatarUrl: string) => {
        // TODO: Check this
        if (!this.inRoster(bareJid))
            return;

        this.cache[bareJid].avatarUrl = avatarUrl;
        await AsyncStorage.setItem("account_roster", JSON.stringify(Object.values(this.cache)));

        this.emit("rosterItemUpdates", this.cache[bareJid]);
    }

    public getRoster = async (): Promise<RosterItem[]> => {
        if (!this.loaded) {
            const data = await AsyncStorage.getItem("account_roster");
            const rosterItems: any[] = data !== null ? JSON.parse(data) : [];
            if (data !== null) {
                for (const item of rosterItems) {
                    // TODO: See TODO Above class
                    const path = await this.avatarCache.getAvatar(this.client, item.jid);
                    if (path)
                        item.avatarUrl = `file://${path}`

                    this.cache[item.jid] = item;
                    console.log(`getRoster: Setting ${item.jid}`);
                }
            }

            this.loaded = true;
            return rosterItems;
        }

        return Object.values(this.cache);
    }
};