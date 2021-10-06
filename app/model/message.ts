import { Model } from "@nozbe/watermelondb";
import { field, text, writer } from "@nozbe/watermelondb/decorators";
import { MessageContentType, MessageEncryptionType } from "../../data/Message";

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
};