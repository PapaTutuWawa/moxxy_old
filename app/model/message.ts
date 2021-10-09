import { Model } from "@nozbe/watermelondb";
import { field, text, writer } from "@nozbe/watermelondb/decorators";
import { MessageContentType, MessageEncryptionType, MessageQuotationType } from "../../data/Message";

export default class Message extends Model {
    static table = "messages";

    // TODO: Add a relation to a sender, once groupchats are a thing
    // TODO: Replace sent_in with a relation
    // TODO: Add OOB url
    @text("body") body: string;
    @text("sent_in") sentIn: string; // E.g. in a conversation with this JID or in the groupchat with this JID
    @field("sent") sent: boolean; // Did we send this message?
    @field("timestamp") timestamp: number; // NOTE: Milliseconds since UNIX epoch
    @text("stanza_id") stanzaId: string;
    @field("encryption") encryption: MessageEncryptionType;
    @text("oob_url") oobUrl: string; // Optional
    @text("thread_id") threadId: string;
    @text("parent_thread_id") parentThreadId: string;

    /**
     * Returns true if the message is to be treated as a sent/received image, video, file, ...
     */
    isOOB = (): boolean => {
        return this.oobUrl && this.oobUrl === this.body;
    }

    getContentType = (): MessageContentType => {
        if (this.isOOB()) {
            if (this.oobUrl.endsWith(".png") || this.oobUrl.endsWith(".jpg"))
                return MessageContentType.IMAGE;
            else
                return MessageContentType.FILE;
        }

        return MessageContentType.TEXT;
    }

    /**
     * Returns the way a message can be quoted
     */
    getQuotation = (): MessageQuotationType => {
        if (this.threadId)
            return MessageQuotationType.THREAD;

        if (!this.isOOB())
            return MessageQuotationType.EMAIL;

        return MessageQuotationType.NONE;
    }
};