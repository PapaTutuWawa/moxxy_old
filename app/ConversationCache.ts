import { Database, Q } from "@nozbe/watermelondb";
import { EventEmitter } from "events";
import { ConversationType } from "../data/Conversation";
import Conversation from "./model/conversation";

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

    public getConversationByJid = async (jid: string): Promise<Conversation> => {
        if (!this.isInitialized) {
            await this.getConversations();
        }

        // TODO: Check if it exists
        return this.cache[jid];
    };

    public updateConversation = (jid: string, args: any): Promise<void> => {
        return this.database.write(async () => {
            const conversation = await this.database.get(Conversation.table).query(
                Q.where("jid", jid)
            ).fetch(); // TODO
            await conversation[0].update(() => {
                if ("lastMessageText" in args)
                    conversation[0].lastMessageText = args.lastMessageText;
                if ("lastMessageOOB" in args)
                    conversation[0].lastMessageOOB = args.lastMessageOOB;
                if ("unreadMessagesCountInc" in args) {
                    conversation[0].unreadMessagesCount = conversation[0].unreadMessagesCount + args.unreadMessagesCountInc;
                } else if ("unreadMessagesCount" in args) {
                    conversation[0].unreadMessagesCount = args.unreadMessagedCount;
                }
            });

            this.cache[jid] = conversation[0] as Conversation;
            this.emit("conversationUpdated", conversation[0]);
        });
    }

    public markAsRead = async (jid: string) => {
        const conversation = await this.getConversationByJid(jid);
        conversation.markAsRead(conversation => {
            this.cache[jid] = conversation;
            this.emit("conversationUpdated", conversation);
        });
    }

    public updateAvatarUrl = async (jid: string, url: string) => {
        const conversation = await this.getConversationByJid(jid);
        await conversation.updateAvatarUrl(`file://${url}`, (conversation => {
            this.emit("conversationUpdated", conversation);
        }));
    }

    public conversationNewMessageAdded = async (jid: string, messageBody: string, incrementUnread: boolean = false) => {
        const conversation = await this.getConversationByJid(jid);
        conversation.updateLastMessage(messageBody, incrementUnread, (conversation: Conversation) => {
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

    public addConversation = async (conversation: any, afterAdd?: (conversation: Conversation) => void): Promise<void> => {
        await this.database.write(async () => {
            await this.database.get(Conversation.table).create((convo: Conversation) => {
                convo.title = conversation.title;
                convo.jid = conversation.jid;
                convo.lastMessageText = conversation.lastMessageText;
                convo.lastMessageOOB = conversation.lastMessageOOB;
                convo.unreadMessagesCount = conversation.unreadMessagesCount;
                convo.avatarUrl = conversation.avatarUrl;
                convo.type = conversation.type;

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