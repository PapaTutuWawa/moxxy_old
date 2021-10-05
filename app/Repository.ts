import { Agent } from "stanza";

import schema from "./model/schema";
import migrations from "./model/migrations";

import * as XMPP from "stanza";
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Database } from "@nozbe/watermelondb";

import { AltConnection, discoverAltConnections } from "../xmpp/xep0156";
import Conversation from "./model/conversation";
import Message from "./model/message";
import { PresenceType } from "stanza/Constants";
import { MessageEncryptionType } from "../data/Message";
import { hack__bareJid } from "../ui/helpers";
import MessageCache from "./MessageCache";
import ConversationCache from "./ConversationCache";
import { ConversationType } from "../data/Conversation";
import DiscoCache from "./DiscoCache";
import RosterCache from "./RosterCache";
import { AvatarCache } from "./AvatarCache";
import RosterItem from "./model/rosteritem";
import { getAvatar } from "../xmpp/avatar";

export default class AppRepository {
    private static instance: AppRepository;

    public static getInstance() {
        if (!this.instance)
            this.instance = new AppRepository();

        return this.instance;
    }

    private client: Agent;
    public getXMPPClient(): Agent {
        return this.client;
    }
    public setXMPPClient(client: Agent) {
        this.client = client;
    }

    private onceConnected: boolean;
    // TODO: Type @args
    public connectXMPP = (args: any, onConnect: () => void) => {
        discoverAltConnections(args.jid.split("@")[1])
        .then((alts: AltConnection) => {
            AppRepository.getInstance().setXMPPClient(XMPP.createClient({
                ...args,
                transports: {
                    websocket: alts.websocketUrl !== "" ? alts.websocketUrl : false,
                    bosh: (alts.boshUrl !== "" && alts.websocketUrl !== "") ? false : alts.boshUrl
                }
            }));

            this.onceConnected = false;
            this.client.on("session:started", () => {
                this.onceConnected = true;
                
                // NOTE: Per RFC, we will only receive messages once we've sent a presence out.
                this.client.sendPresence({
                    type: PresenceType.Available
                });

                this.client.getDiscoInfo(args.jid).then((data: XMPP.Stanzas.DiscoInfoResult) => {
                    this.getDiscoCache().setFeatures(hack__bareJid(args.jid), data.features);
                });

                this.client.getRoster().then((roster: XMPP.Stanzas.RosterResult) => {
                    this.getRosterCache().setRoster(roster.items);
                });

                onConnect();
            });
            this.client.on("stream:management:resumed", obj => {
                if (!this.onceConnected) {
                    this.onceConnected = true;
                    this.client.getDiscoInfo(args.jid).then((data: XMPP.Stanzas.DiscoInfoResult) => {
                        this.getDiscoCache().setFeatures(hack__bareJid(args.jid), data.features);
                    });

                    this.client.getRoster().then((roster: XMPP.Stanzas.RosterResult) => {
                        this.getRosterCache().setRoster(roster.items);
                    });

                    // TODO: Do this for each user in the roster if we don't have their avatar in our filesystem.
                    //       Note that we don't have to do this each login, just when we don't have them, as updates
                    //       are handled by the "avatar" event.
                    //getAvatar(this.client, "papatutuwawa@polynom.me");

                    onConnect();
                }
            });
            this.getDiscoCache().on("featuresDiscovered", (jid: string) => {
                const bareJid = hack__bareJid(args.jid);
                if (jid !== bareJid)
                    return;

                if (this.getDiscoCache().supportsNamespace(bareJid, "urn:xmpp:push:0"))
                    console.log("Push is supported. Enabling...");
            });
            this.client.on("raw:incoming", xml => console.log(`<-- ${xml}`));
            this.client.on("raw:outgoing", xml => console.log(`--> ${xml}`));
            this.client.on("message", async (msg: XMPP.Stanzas.ReceivedMessage) => {
                // TODO: Check if this is a carbon or something else we might have to handle
                // TODO(groupchat): Remove the last check
                if (!msg.body || msg.type !== "chat")
                    return;

                const isOOB = msg.links && msg.links.length > 0 && msg.links[0].url && msg.links[0].url.startsWith("https://");
                const bareJid = hack__bareJid(msg.from);
                const hasConversation = await this.getConversationCache().hasConversation(bareJid);
                // TODO: Use [Image], [File], [Video]
                const lastMessageText = isOOB ? "[Image]" : msg.body;
                console.log(lastMessageText);
                let promiseChain = new Promise((res, rej) => res(null));
                if (!hasConversation)
                    promiseChain = promiseChain.then(async () => {
                        let title = bareJid.split("@")[0]; // TODO: Maybe make this a bit safer.
                        if (this.getRosterCache().inRoster(bareJid)) {
                            const nickname = (await this.getRosterCache().getRosterItemByJid(bareJid)).nickname;
                            if (nickname)
                                title = nickname;
                        }

                        await this.getConversationCache().addConversation({
                            title,
                            jid: bareJid,
                            lastMessageText,
                            lastMessageOOB: isOOB,
                            unreadMessagesCount: 1,
                            type: ConversationType.DIRECT,
                        });
                    });

                promiseChain = promiseChain.then(async () => {
                    await this.getMessageCache().addMessage({
                        body: msg.body,
                        sentIn: bareJid,
                        sent: false,
                        timestamp: new Date().getTime(),
                        stanzaId: msg.stanzaIds["id"],
                        encryption: MessageEncryptionType.NONE, // TODO
                        oobUrl: isOOB ? msg.links[0].url : ""
                    });
                });

                if (hasConversation)
                    // Prevent us from updating the list item twice
                    promiseChain.then(async () => {
                        console.log(`Open JID: ${this.getOpenConversationJid()}`);
                        await this.getConversationCache().conversationNewMessageAdded(bareJid, lastMessageText, this.getOpenConversationJid() !== bareJid)
                    });
                else
                    promiseChain.then(async () => {
                        const avatarPath = await this.getAvatarCache().getAvatar(this.getXMPPClient(), bareJid);
                        if (avatarPath)
                            this.getConversationCache().updateAvatarUrl(bareJid, `file://${avatarPath}`);
                    });

                console.log(`Got message "${msg.body}" from ${msg.from}`);
                console.log(msg.stanzaIds);
            });

            if ("smState" in args) {
                console.log("We have a Stream Management state. Applying");
                if (args.smState)
                    this.client.sm.load(JSON.parse(args.smState, XMPP.Utils.reviveData));
                else
                    console.log("SM State empty. Ignoring...");
            }

            console.log("Connecting...");
            this.client.connect();
        })
        .catch(err => {
            // TODO
            console.log(JSON.stringify(err));
        });
    }

    public requestAndSetAvatar = async (bareJid: string) => {
        const data = await this.getAvatarCache().getAvatar(this.getXMPPClient(), bareJid);
        if (!data.hasValue())
            await this.getRosterCache().setNoAvatarForJid(bareJid);
        else
            await this.getRosterCache().updateRosterItemAvatarUrl(bareJid, `file://${data.getValue()}`);
    }

    private openConversationJid: string = "";
    public getOpenConversationJid = () => this.openConversationJid;
    public setOpenConversationJid = (jid: string) => this.openConversationJid = jid;
    public resetOpenConversationJid = () => this.setOpenConversationJid("");

    private messageCache: MessageCache;
    public getMessageCache(): MessageCache {
        if (!this.messageCache)
            this.messageCache = new MessageCache(this.getDb());
        return this.messageCache;
    }

    private conversationCache: ConversationCache;
    public getConversationCache(): ConversationCache {
        if (!this.conversationCache)
            this.conversationCache = new ConversationCache(this.getDb());
        return this.conversationCache;
    }

    private discoCache: DiscoCache;
    public getDiscoCache(): DiscoCache {
        if (!this.discoCache)
            this.discoCache = new DiscoCache();
        return this.discoCache;
    }

    private rosterCache: RosterCache;
    public getRosterCache(): RosterCache {
        if (!this.rosterCache)
            this.rosterCache = new RosterCache(this.getDb());
        return this.rosterCache;
    }

    private avatarCache: AvatarCache;
    public getAvatarCache(): AvatarCache {
        if (!this.avatarCache)
            this.avatarCache = new AvatarCache();
        return this.avatarCache;
    }

    private databaseAdapter: SQLiteAdapter;
    public getDbAdapter = (): SQLiteAdapter => {
        if (!this.databaseAdapter)
            this.databaseAdapter = new SQLiteAdapter({
                schema,
                migrations,
            });

        return this.databaseAdapter;
    }

    private database: Database;
    public getDb = (): Database => {
        if (!this.database)
            this.database = new Database({
                adapter: this.getDbAdapter(),
                modelClasses: [
                    Conversation,
                    Message,
                    RosterItem
                ]
            });
        
        return this.database;
    };
}