enum MessageType {
    MESSAGE_CHAT,
    MESSAGE_GROUPCHAT
};

enum MessageContentType {
    TEXT,
    STICKER,
    IMAGE,
    FILE
};

enum MessageEncryptionType {
    NONE = 0,
    OMEMO = 1
};

export {
    MessageType, MessageContentType, MessageEncryptionType
};