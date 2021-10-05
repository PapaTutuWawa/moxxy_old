import User from "./User";

export default class Account {
    constructor(
        public jid: string,
        public roster: User[]
    ) {}
}