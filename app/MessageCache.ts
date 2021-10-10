import { Database, Q } from "@nozbe/watermelondb";
import { EventEmitter } from "events";
import Message from "./model/message";

export default class MessageCache extends EventEmitter {
    private cache: {[sentIn: string]: Message[]};
    private readonly database: Database;

    constructor(database: Database) {
        super();

        this.cache = {};
        this.database = database;
    }

    public getMessages = async (sentIn: string): Promise<Message[]> => {
        if (sentIn in this.cache)
            return this.cache[sentIn];

        const messages: Message[] = await this.database
            .get(Message.table)
            .query(
                Q.where("sent_in", sentIn),
                // TODO: Sort by timestamp
                //Q.experimentalSortBy()
            ).fetch() as Message[];

        this.cache[sentIn] = messages;
        return messages;
    }

    public prepareAddMessage = async (msg: any) => {
        // NOTE: This is to prevent the chat from only having one message if
        //       we receive a message before first trying to load them.
        if (!(msg.sentIn in this.cache)) {
            await this.getMessages(msg.sentIn);
        }

        return this.database.get(Message.table).prepareCreate((message: Message) => {
            // TODO: There has to be a better way
            message.body = msg.body;
            message.sentIn = msg.sentIn;
            message.sent = msg.sent;
            message.timestamp = msg.timestamp;
            message.stanzaId = msg.stanzaId;
            message.encryption = msg.encryption;
            message.oobUrl = msg.oobUrl || "";
            message.threadId = msg.threadId || "";
            message.parentThreadId = msg.parentThreadId || "";

            // NOTE: It feels really weird to do it here, but we cannot change
            //       model attributes outside of create/...
            // TODO: Maybe put it asynchronously into the cache to prevent blocking
            //       this callback
            if (msg.sentIn in this.cache)
                this.cache[msg.sentIn] = [...this.cache[msg.sentIn], message];
            else
                this.cache[msg.sentIn] = [message];
            
            this.emit("messageAdd", message);
        });
    }

    public addMessage = async (msg: any): Promise<void> => {
        // NOTE: This is to prevent the chat from only having one message if
        //       we receive a message before first trying to load them.
        if (!(msg.sentIn in this.cache)) {
            await this.getMessages(msg.sentIn);
        }

        return this.database.write(async () => {
            await this.database.get(Message.table).create((message: Message) => {
                // TODO: There has to be a better way
                message.body = msg.body;
                message.sentIn = msg.sentIn;
                message.sent = msg.sent;
                message.timestamp = msg.timestamp;
                message.stanzaId = msg.stanzaId;
                message.encryption = msg.encryption;
                message.oobUrl = msg.oobUrl || "";
                message.threadId = msg.threadId || "";
                message.parentThreadId = msg.parentThreadId || "";
                message.isEdited = false;

                // NOTE: It feels really weird to do it here, but we cannot change
                //       model attributes outside of create/...
                // TODO: Maybe put it asynchronously into the cache to prevent blocking
                //       this callback
                if (msg.sentIn in this.cache)
                    this.cache[msg.sentIn] = [...this.cache[msg.sentIn], message];
                else
                    this.cache[msg.sentIn] = [message];
                
                this.emit("messageAdd", message);
            });
        });
    };
};