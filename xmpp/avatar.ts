import * as XMPP from "stanza";

import Maybe from "../app/types/maybe";

// TODO: Fall back to XEP-0084 if vCards did not work
export async function getAvatar(client: XMPP.Agent, bareJid: string): Promise<Maybe<string>> {
    // First try vCards (XEP-0153/XEP-0054)
    const vcard: XMPP.Stanzas.VCardTemp = await client.getVCard(bareJid);
    const record = vcard.records.find(record => record.type === "photo");
    if (record) {
        if ("data" in record) {
            return new Maybe(record.data.toString());
        }
    }

    return new Maybe();
}