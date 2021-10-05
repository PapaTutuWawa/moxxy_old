import { PresenceType } from "../data/Presence";
import { Colors } from 'react-native/Libraries/NewAppScreen';

export function badgeStatus(presence: PresenceType) {
    switch (presence) {
        case PresenceType.AVAILABLE:
            return "success";
        case PresenceType.AWAY:
            return "warning";
        case PresenceType.DND:
            return "error";
    }
}

export function backgroundStyle(isDarkMode: boolean = true) {
    return {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };
}

/**
 * Pads a number between(inclusive) 0 and 9 with a leading zero. Other
 * numbers get returned as a string without any modification.
 */
export function padNumber(num: number): string {
    return num >= 0 && num <= 9 ? `0${num}` : `${num}`;
}

/**
 * A hacky way to turn a (possibly) full JID into a bare JID 
 */
export function hack__bareJid(jid: string): string {
    const parts = jid.split("/");
    if (parts.length <= 2) {
        return parts[0];
    } else {
        console.log("Found a weird JID: " + jid);
        return parts[0];
    }
}