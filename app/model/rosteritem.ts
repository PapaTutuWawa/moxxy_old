import { Model } from "@nozbe/watermelondb";
import { field, text, writer } from "@nozbe/watermelondb/decorators";

export default class RosterItem extends Model {
    static table = "roster_items";

    @text("jid") jid: string;
    @text("nickname") nickname?: string;
    @text("avatar_url") avatarUrl: string;
    @field("has_avatar") hasAvatar: boolean;

    @writer async updateAvatarUrl(avatarUrl: string, callback: (item: RosterItem) => void) {
        await this.update(item => {
            item.avatarUrl = avatarUrl;
            item.hasAvatar = true;

            callback(item);
        });
    }

    @writer async setNoAvatarUrl(callback: (item: RosterItem) => void) {
        await this.update(item => {
            item.avatarUrl = "";
            item.hasAvatar = false;

            callback(item);
        });
    }
};