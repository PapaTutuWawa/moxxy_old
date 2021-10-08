import { Model } from "@nozbe/watermelondb";
import { field, text, json, writer } from "@nozbe/watermelondb/decorators";
import { ConversationType } from "../../data/Conversation";

export default class Conversation extends Model {
    static table = "conversations";

    @text("title") title: string;
    @text("jid") jid: string;
    @text("last_message_text") lastMessageText: string;
    @field("last_message_oob") lastMessageOOB: boolean;
    @field("unread_messages_count") unreadMessagesCount: number;
    @field("has_avatar") hasAvatar: boolean;
    @text("avatar_url") avatarUrl: string;
    @field("type") type: ConversationType;
    @field("last_message_timestamp") lastMessageTimestamp: number;
    @field("open") open: boolean; // Whether the conversation should be shown in the ConversationListView
    @json("media", (media) => Array.isArray(media) ? media : []) media: string[];

    @writer async updateLastMessage (body: string, timestamp: number, isOOB: boolean, oobUrl: string, incrementUnread: boolean = false, callback: (conversation: Conversation) => void = () => {}) {
        await this.update(conversation => {
            conversation.lastMessageText = body;
            conversation.lastMessageTimestamp = timestamp
            conversation.lastMessageOOB = isOOB;

            // TODO: This needs to be improved
            if (isOOB)
                conversation.media = conversation.media.concat(oobUrl);

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
            conversation.hasAvatar = true;

            callback(conversation);
        });
    }

    @writer async setNoAvatar() {
        await this.update(conversation => {
            conversation.avatarUrl = "";
            conversation.hasAvatar = false;
        });
    }

    @writer async setOpen(open: boolean) {
        await this.update(conversation => {
            conversation.open = open;
        })
    }
};