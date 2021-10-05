import { Model } from "@nozbe/watermelondb";
import { field, text, writer } from "@nozbe/watermelondb/decorators";
import { ConversationType } from "../../data/Conversation";

export default class Conversation extends Model {
    static table = "conversations";

    @text("title") title: string;
    @text("jid") jid: string;
    @text("last_message_text") lastMessageText: string;
    @field("last_message_oob") lastMessageOOB: boolean;
    @field("unread_messages_count") unreadMessagesCount: number;
    @text("avatar_url") avatarUrl: string;
    @field("type") type: ConversationType;
    // @field("last_message_timestamp") lastMessageTimestamp: number;

    @writer async updateLastMessage (body: string, incrementUnread: boolean = false, callback: (conversation: Conversation) => void = () => {}) {
        await this.update(conversation => {
            conversation.lastMessageText = body;
            // conversation.lastMessageTimestamp = ???;

            if (incrementUnread)
                conversation.unreadMessagesCount += 1;

            callback(conversation);
        });
    }

    @writer async markAsRead(callback: (conversation: Conversation) => void) {
        await this.update(conversation => {
            conversation.unreadMessagesCount = 0;

            callback(conversation);
        });
    }

    @writer async updateAvatarUrl(avatarUrl: string, callback: (conversation: Conversation) => void) {
        await this.update(conversation => {
            conversation.avatarUrl = avatarUrl;

            callback(conversation);
        });
    }
};