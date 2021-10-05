import * as XMPP from "stanza";

// TODO: Use react-native-fs to write the avatars to cache and resolve to their path
// TODO: Fall back to XEP-0084 if vCards did not work
export async function getAvatar(client: XMPP.Agent, bareJid: string) {
    // First try vCards (XEP-0153/XEP-0054)
    const vcard: XMPP.Stanzas.VCardTemp = await client.getVCard(bareJid);
    const record = vcard.records.find(record => record.type === "photo");
    if (record) {
        if ("mediaType" in record)
            console.log("mediaType: " + record.mediaType);
        if ("data" in record) {
            console.log("data: " + record.data.toString());
            return record.data.toString();
        }
    }

    return "";
}