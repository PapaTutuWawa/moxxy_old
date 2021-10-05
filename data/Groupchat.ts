import { Message } from "./Message";
import { GroupchatMember } from "./User";

export default class Groupchat {
    constructor(
        jid: string,
        title: string,
        avatarUrl: string,
        lastMessage: Message,
        messages: Message[],
        members: GroupchatMember[]
    ) {}
}