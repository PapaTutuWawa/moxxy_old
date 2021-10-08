export enum MessageType {
    MESSAGE_CHAT,
    MESSAGE_GROUPCHAT
};

export enum MessageContentType {
    TEXT,
    STICKER,
    IMAGE,
    FILE
};

export enum MessageEncryptionType {
    NONE = 0,
    OMEMO = 1
};

export enum MessageQuotationType {
    EMAIL, // Quotation by putting "> " infront of the text
    THREAD, // By using <thread parent=""> and XEP-0201
    NONE // Message cannot be quoted
}