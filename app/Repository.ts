import { Agent } from "stanza";

import schema from "./model/schema";
import migrations from "./model/migrations";

import * as XMPP from "stanza";
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Database } from "@nozbe/watermelondb";

import { AltConnection, discoverAltConnections } from "../xmpp/xep0156";
import { Conversation } from "./model/conversation";
import { Message } from "./model/message";
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
import { UserData } from "../data/User";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CapabilityDatabase from "../data/entity-caps.json";

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

    private userData: UserData;
    public setUserData(data: UserData) {
        this.userData = data;
    }
    public updateAndSaveUserData = async (data: Partial<UserData>) => {
        const obj = { ...this.userData, ...data};
        this.setUserData(obj);
        await AsyncStorage.setItem("@account_metadata", JSON.stringify(this.userData));
    }
    /**
     * Returns the account metadata. Note that the guarantee to return data is only given
     * once the ConversationsListView, ... is shown.
     */
    public getUserData() {
        return this.userData;
    }
    public loadOrSetUserData = async (jid: string, serverJid: string) => {
        const data = await AsyncStorage.getItem("@account_metadata");
        if (data !== null) {
            const obj = JSON.parse(data);
            this.setUserData({
                jid,
                serverJid,
                avatarUrl: obj.avatarUrl,
                hasAvatar: obj.hasAvatar
            });
        } else {
            this.setUserData({
                jid,
                serverJid,
                avatarUrl: "",
                hasAvatar: true
            });
            await AsyncStorage.setItem("@account_metadata", JSON.stringify(this.userData));
        }
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
            this.client.on("session:started", async () => {
                this.onceConnected = true;
                
                // NOTE: Per RFC, we will only receive messages once we've sent a presence out.
                this.client.sendPresence({
                    type: PresenceType.Available
                });

                const serverJid = hack__bareJid(args.jid).split("@")[1];
                this.client.getDiscoInfo(serverJid).then((data: XMPP.Stanzas.DiscoInfoResult) => {
                    this.getDiscoCache().setFeatures(serverJid, data.features);
                });

                this.client.getRoster().then((roster: XMPP.Stanzas.RosterResult) => {
                    this.getRosterCache().setRoster(roster.items);
                });

                await this.loadOrSetUserData(args.jid, serverJid);

                onConnect();
            });
            this.client.on("stream:management:resumed", async (obj) => {
                if (!this.onceConnected) {
                    this.onceConnected = true;
                    const serverJid = hack__bareJid(args.jid).split("@")[1];
                    this.client.getDiscoInfo(serverJid).then((data: XMPP.Stanzas.DiscoInfoResult) => {
                        this.getDiscoCache().setFeatures(serverJid, data.features);
                    });

                    this.client.getRoster().then((roster: XMPP.Stanzas.RosterResult) => {
                        this.getRosterCache().setRoster(roster.items);
                    });

                    // TODO: Do this for each user in the roster if we don't have their avatar in our filesystem.
                    //       Note that we don't have to do this each login, just when we don't have them, as updates
                    //       are handled by the "avatar" event.
                    //getAvatar(this.client, "papatutuwawa@polynom.me");

                    await this.loadOrSetUserData(args.jid, serverJid);

                    onConnect();
                }
            });

            this.client.on("presence", async (presence) => {
                // TODO: If we receive a subscription request, open an empty chat
                // TODO: Only do this if the bare JID is in the roster?
                if (presence.legacyCapabilities) {
                    console.log(presence.legacyCapabilities);

                    // Check if we know any of these
                    for (const cap of presence.legacyCapabilities) {
                        if (cap.algorithm !== "sha-1")
                            continue;
                        
                        if (cap.value in CapabilityDatabase && CapabilityDatabase[cap.value].hash === "sha-1") {
                            this.getDiscoCache().setFeatures(presence.from, CapabilityDatabase[cap.value].features);
                            return;
                        }
                    }

                    // TODO: Error handling
                    // TODO: Cache the mapping of EntCap-Hash and features
                    // We did not find them
                    const disco = await this.getXMPPClient().getDiscoInfo(presence.from);
                    this.getDiscoCache().setFeatures(presence.from, disco.features);
                }
            });
            this.client.on("raw:incoming", xml => console.log(`<-- ${xml}`));
            this.client.on("raw:outgoing", xml => console.log(`--> ${xml}`));
            this.client.on("message", async (msg: XMPP.Stanzas.ReceivedMessage) => {
                // TODO: Check if this is a carbon or something else we might have to handle
                // TODO(groupchat): Remove the last check
                if (!msg.body || msg.type !== "chat")
                    return;

                const isOOB = msg.links && msg.links.length > 0 && msg.links[0].url && msg.links[0].url.startsWith("https://");
                const oobUrl = isOOB ? msg.links[0].url : "";
                const bareJid = hack__bareJid(msg.from);
                const hasConversation = await this.getConversationCache().hasConversation(bareJid);
                // TODO: Use [Image], [File], [Video]
                const lastMessageText = isOOB ? "[Image]" : msg.body;
                const timestamp = new Date().getTime();
                console.log(`Got message "${msg.body}" from ${msg.from}`);
                console.log(msg.stanzaIds);

                this.getDb().write(async () => {
                    let title = bareJid.split("@")[0]; // TODO: Maybe make this a bit safer.
                    if (this.getRosterCache().inRoster(bareJid)) {
                        const nickname = (await this.getRosterCache().getRosterItemByJid(bareJid)).nickname;
                        if (nickname)
                            title = nickname;
                    }

                    const conditional = hasConversation ? [
                        await this.getConversationCache().conversationPrepareNewMessageAdded(bareJid, timestamp, lastMessageText, isOOB, oobUrl, this.getOpenConversationJid() !== bareJid)
                    ] : [
                        this.getConversationCache().prepareAddConversation({
                            title,
                            jid: bareJid,
                            lastMessageText,
                            lastMessageTimestamp: timestamp,
                            lastMessageOOB: isOOB,
                            unreadMessagesCount: 1,
                            type: ConversationType.DIRECT,
                        }),

                    ];
                    await this.getDb().batch(
                        await this.getMessageCache().prepareAddMessage({
                            body: msg.body,
                            sentIn: bareJid,
                            sent: false,
                            timestamp: timestamp,
                            stanzaId: msg.stanzaIds["id"],
                            encryption: MessageEncryptionType.NONE, // TODO
                            oobUrl: isOOB ? msg.links[0].url : "",
                            threadId: msg.thread || "",
                            parentThreadId: msg.parentThread || "",
                        }),
                        ...conditional
                    );
                });
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

    public requestAndSetAvatar = async (bareJid: string, type: "roster" | "conversation") => {
        if (this.getAvatarCache().hasRunningRequest(bareJid))
            return;

        try {
            const data = await this.getAvatarCache().getAvatar(this.getXMPPClient(), bareJid);
            if (!data.hasValue()) {
                switch (type) {
                    case "roster":
                        await this.getRosterCache().setNoAvatarForJid(bareJid);
                        break;
                    case "conversation":
                        await this.getConversationCache().setNoAvatarForJid(bareJid);
                        break;
                }
            } else {
                switch (type) {
                    case "roster":
                        await this.getRosterCache().updateRosterItemAvatarUrl(bareJid, `file://${data.getValue()}`);
                        break;
                    case "conversation":
                        await this.getConversationCache().updateAvatarUrl(bareJid, `file://${data.getValue()}`);
                        break;
                }
            }
        } catch (e) {
            await this.getRosterCache().setNoAvatarForJid(bareJid);
        }  
    }

    // TODO: Also send a presence subscription request
    public addRosterItem = async (bareJid: string) => {
        await this.getXMPPClient().updateRosterItem({
            jid: bareJid,
            subscription: "from"
        });
        await this.getRosterCache().addRosterItem({
            jid: bareJid,
            // nickname: ""
        });
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