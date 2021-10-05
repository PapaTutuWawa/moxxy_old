import { EventEmitter } from "events";

import * as XMPP from "stanza";
import { AvatarCache } from "./AvatarCache";
import { Database, Q } from "@nozbe/watermelondb";
import RosterItem from "./model/rosteritem";

// TODO: Don't request the avatars in getRoster to prevent blocking the roster loading
export default class RosterCache extends EventEmitter {
    private cache: {[jid: string]: RosterItem};
    private loaded: boolean;

    constructor(private database: Database) {
        super();

        this.cache = {};
        this.loaded = false;
    }

    public setRoster = async (items: XMPP.Stanzas.RosterItem[]) => {
        if (!this.loaded)
            await this.getRoster();

        const collection = this.database.get(RosterItem.table);
        // TODO: What if we have local changes?
        const batchWrites = items.map(item => {
            if (!this.inRoster(item.jid))
                return collection.prepareCreate((rosterItem: RosterItem) => {
                    rosterItem.jid = item.jid;
                    rosterItem.nickname = item.name;
                    rosterItem.avatarUrl = "";
                    rosterItem.hasAvatar = true;

                    this.cache[item.jid] = rosterItem;
                });
        });

        await this.database.write(async () => {
            await this.database.batch(...batchWrites);
        });

        this.emit("rosterSet", Object.values(this.cache));
    }

    /**
     * Returns true if @jid is in the roster. Assumes that the function is called after
     * getRoster or setRoster has been called at least once.
     * */
    public inRoster = (jid: string) => {
        return jid in this.cache;
    }

    // TODO: Check if in roster
    public getRosterItemByJid = async (bareJid: string): Promise<RosterItem> => {
        if (!this.loaded)
            await this.getRoster();

        return this.cache[bareJid];
    }

    public updateRosterItemAvatarUrl = async (bareJid: string, avatarUrl: string) => {
        // TODO: Check this
        if (!this.inRoster(bareJid))
            return;

        const item = await this.getRosterItemByJid(bareJid);
        await item.updateAvatarUrl(avatarUrl, rosterItem => {
            this.cache[rosterItem.jid] = rosterItem;

            this.emit("rosterItemUpdated", rosterItem);
        });
    }

    public setNoAvatarForJid = async (bareJid: string) => {
        // TODO: Check this
        if (!this.inRoster(bareJid))
            return;

        const item = await this.getRosterItemByJid(bareJid);
        await item.setNoAvatarUrl(rosterItem => {
            this.cache[rosterItem.jid] = rosterItem;

            this.emit("rosterItemUpdated", rosterItem);
        });
    }


    public getRoster = async (): Promise<RosterItem[]> => {
        if (!this.loaded) {
            const items: RosterItem[] = await this.database.get(RosterItem.table)
                .query()
                .fetch() as RosterItem[];
            items.forEach(item => {
                this.cache[item.jid] = item;
            });

            this.loaded = true;
            return items;
        }

        return Object.values(this.cache);
    }
};