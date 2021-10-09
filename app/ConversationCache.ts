import { Database, Q } from "@nozbe/watermelondb";
import { EventEmitter } from "events";
import { ConversationType } from "../data/Conversation";
import Conversation from "./model/conversation";
import Maybe from "./types/maybe";

export default class ConversationCache extends EventEmitter {
    private cache: {[jid: string]: Conversation};
    private isInitialized: boolean;
    private readonly database: Database;

    constructor(database: Database) {
        super();

        this.cache = {};
        this.isInitialized = false;
        this.database = database;
    }

    public getConversations = async (): Promise<Conversation[]> => {
        if (!this.isInitialized) {
            const conversations: Conversation[] = await this.database.get(Conversation.table)
                .query()
                .fetch() as Conversation[];
            conversations.forEach((conversation: Conversation) => {
                this.cache[conversation.jid] = conversation;
            });
            this.isInitialized = true;
        }

        return Object.values(this.cache);
    }

    public getConversationByJid = async (jid: string): Promise<Maybe<Conversation>> => {
        if (!this.isInitialized) {
            await this.getConversations();
        }

        // TODO: Check if it exists
        return new Maybe(this.cache[jid]);
    };

    public markAsRead = async (jid: string) => {
        const conversation = await this.getConversationByJid(jid);
        if (!conversation.hasValue()) {
            console.log(`markAsRead: No conversation for ${jid}!`);
            return;
        }

        conversation.getValue().markAsRead(conversation => {
            this.cache[jid] = conversation;
            this.emit("conversationUpdated", conversation);
        });
    }

    public updateAvatarUrl = async (jid: string, url: string) => {
        const conversation = await this.getConversationByJid(jid);
        if (!conversation.hasValue()) {
            console.log(`updateAvatarUrl: No conversation for ${jid}!`);
            return;
        }

        await conversation.getValue().updateAvatarUrl(url, (conversation => {
            this.emit("conversationUpdated", conversation);
        }));
    }

    public setNoAvatarForJid = async (jid: string) => {
        const conversation = await this.getConversationByJid(jid);
        if (!conversation.hasValue()) {
            console.log(`setNoAvatarForJid: No conversation for ${jid}!`);
            return;
        }

        await conversation.getValue().setNoAvatar();
        // TODO: Maybe trigger an event
    }

    public conversationNewMessageAdded = async (jid: string, timestamp: number, messageBody: string, isOOB: boolean, oobUrl: string, incrementUnread: boolean = false) => {
        const conversation = await this.getConversationByJid(jid);
        if (!conversation.hasValue()) {
            console.log(`conversationNewMessageAdded: No conversation for ${jid}!`);
            return;
        }

        conversation.getValue().updateLastMessage(messageBody, timestamp, isOOB, oobUrl, incrementUnread, true, (conversation: Conversation) => {
            this.cache[jid] = conversation;
            this.emit("conversationUpdated", conversation);
        });
    }

    /**
     * Returns this JIDs of known conversations
     */
    public getConversationsAsJids = async (): Promise<string[]> => {
        await this.getConversations();
        return Object.keys(this.cache);
    }

    /**
     * Checks whether a conversation with a given JID is already active. Returns true if that's the case.
     * false otherwise.
     */
    public hasConversation = async (jid: string): Promise<boolean> => {
        await this.getConversations();

        // We know that the cache is now populated
        return jid in this.cache;
    }

    public setConversationOpen = async (jid: string, open: boolean) => {
        const conversation = await this.getConversationByJid(jid);
        if (!conversation.hasValue()) {
            console.log(`setConversationOpen: No conversation for ${jid}!`);
            return;
        }

        await conversation.getValue().setOpen(open);
        // NOTE: Not sure, but this messes with ProfileView upon closing
        //this.emit("conversationUpdated", conversation);
    }

    public addConversation = async (conversation: any, afterAdd?: (conversation: Conversation) => void): Promise<void> => {
        await this.database.write(async () => {
            await this.database.get(Conversation.table).create((convo: Conversation) => {
                convo.title = conversation.title;
                convo.jid = conversation.jid;
                convo.lastMessageText = conversation.lastMessageText;
                convo.lastMessageTimestamp = conversation.lastMessageTimestamp;
                convo.lastMessageOOB = conversation.lastMessageOOB;
                convo.unreadMessagesCount = conversation.unreadMessagesCount;
                convo.avatarUrl = conversation.avatarUrl;
                convo.hasAvatar = true;
                convo.type = conversation.type;
                convo.open = true; // TODO: Maybe take from the parameter
                convo.media = [];

                // NOTE: It feels really weird to do it here, but we cannot change
                //       model attributes outside of create/...
                // TODO: Maybe put it asynchronously into the cache to prevent blocking
                //       this callback
                this.cache[conversation.jid] = convo;
                if (afterAdd)
                    afterAdd(convo);

                (async () => this.emit("conversationAdd", convo))();
            });
        });
    };
};