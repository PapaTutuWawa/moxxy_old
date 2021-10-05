import { appSchema, tableSchema } from "@nozbe/watermelondb/Schema";

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: "conversations",
            columns: [
                { name: "title", type: "string" },
                { name: "jid", type: "string" },
                { name: "last_message_text", type: "string" },
                { name: "last_message_oob", type: "boolean" },
                { name: "unread_messages_count", type: "number" },
                { name: "avatar_url", type: "string" },
                { name: "type", type: "number" }
            ]
        }),
        tableSchema({
            name: "messages",
            columns: [
                { name: "body", type: "string" },
                { name: "sent_in", type: "string" },
                { name: "sent", type: "boolean" },
                { name: "timestamp", type: "number" },
                { name: "stanza_id", type: "string" },
                { name: "encryption", type: "number" },
                { name: "oob_url", type: "string" }
            ]
        }),
        tableSchema({
            name: "roster_items",
            columns: [
                { name: "jid", type: "string" },
                { name: "nickname", type: "string", isOptional: true },
                { name: "avatar_url", type: "string" },
                { name: "has_avatar", type: "boolean" }
            ]
        })
    ]
});