import { PresenceType } from "./Presence";
import { Message } from "./Message";

export class User {
    constructor(
        public username: string,
        public jid: string,
        public avatarUrl: string,
        public lastMessage: string,
        public unreadMessages: number,
        public presence: PresenceType,
        public chat: Message[]
    ) {}
};

export class GroupchatMember {
    constructor(
        public nick: string,
        public avatarUrl: string,
        public jid: string,
        public groupchatJid: string
    ) {}
};