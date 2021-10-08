import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { Text, Avatar } from "react-native-elements";
import { backgroundStyle, hack__bareJid } from "../helpers";
import AppRepository from "../../app/Repository";
import { ConversationType } from "../../data/Conversation";
import { PresenceType } from "../../data/Presence";
import { Routes } from "../constants";
import RosterItem from "../../app/model/rosteritem";
import FlatHeader from "../FlatHeader";
import { material } from "react-native-typography";

interface NewChatViewState {
    roster: RosterItem[];
    key: number;
};

// TODO: Maybe replace FlatList with a SectionList and sort everything alphabetically.
//       This, or a searchbar
// TODO: When adding a new contact, offer the option to enter a JID or scan a QR code that encodes an XMPP Uri
export default class NewChatView extends React.Component {
    state: NewChatViewState;
    private navigation: any;

    private extraEntries = [
        {
            title: "New contact",
            icon: {
                type: "font-awesome",
                name: "user-plus"
            },
            callback: () => {
                this.navigation.navigate(Routes.NEWCONTACT)
            }
        }
    ];

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;

        this.state = {
            roster: [],
            key: 0
        };

        AppRepository.getInstance().getRosterCache().on("rosterSet", this.setRoster);
        AppRepository.getInstance().getRosterCache().on("rosterItemUpdated", this.onRosterItemUpdates);
        AppRepository.getInstance().getRosterCache()
            .getRoster()
            .then(this.setRoster);
    }

    onRosterItemUpdates = (rosterItem: RosterItem) => {
        this.setState({
            roster: this.state.roster.map(item => item.jid === rosterItem.jid ? rosterItem : item),
            key: this.state.key + 1
        });
    }

    setRoster = (roster: RosterItem[]) => {
        this.setState({
            roster,
            key: this.state.key + 1
        });
    }

    componentWillUnmount = () => {
        AppRepository.getInstance().getRosterCache().removeListener("rosterSet", this.setRoster);
        AppRepository.getInstance().getRosterCache().on("rosterItemUpdated", this.onRosterItemUpdates);
    }

    renderRosterItem = (item: RosterItem) => {
        if (item.hasAvatar && !item.avatarUrl) {
            AppRepository.getInstance().requestAndSetAvatar(item.jid, "roster");
        }

        const name = item.nickname ? item.nickname : item.jid;
        const avatarDisplayProps = item.avatarUrl ? {source: { uri: item.avatarUrl }} : {title: name[0]};
        return (
            <TouchableOpacity
                onPress={async () => {
                    if (await AppRepository.getInstance().getConversationCache().hasConversation(item.jid)) {
                        this.navigation.reset({
                            index: 1,
                            routes: [
                                { name: Routes.CONVERSATIONLIST },
                                { name: Routes.CONVERSATION, params: { conversationJid: item.jid } }
                            ]
                        });
                        return;
                    }

                    AppRepository.getInstance().getConversationCache()
                        .addConversation({
                            avatarUrl: item.avatarUrl,
                            jid: item.jid,
                            lastMessageText: "",
                            lastMessageTimestamp: 0,
                            unreadMessagesCount: 0,
                            title: item.nickname ? item.nickname : item.jid.split("@")[0], // TODO: Check the split stuff
                            type: ConversationType.DIRECT
                        }, (conversation) => {
                            this.navigation.reset({
                                index: 1,
                                routes: [
                                    { name: Routes.CONVERSATIONLIST },
                                    { name: Routes.CONVERSATION, params: { conversationJid: item.jid } }
                                ]
                            });
                        });
                }}
                style={{
                    width: "100%",
                    paddingLeft: 10,
                    paddingRight: 10,
                    marginTop: 5,
                    flexDirection: "row"
                    }}>
                <View style={{ marginLeft: 5, alignSelf: "center", flexDirection: "row" }}>
                    <Avatar rounded size="medium" {...avatarDisplayProps} />
                </View>
                <View>
                    {/* TODO: Make this split stuff nicer */}
                    <Text style={[material.headlineWhite, { color: "white", marginLeft: 10 }]}>{item.nickname || hack__bareJid(item.jid).split("@")[0]}</Text>
                    <Text style={{ color: "white", marginLeft: 10 }}>{item.jid}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    renderButtonItem = (title: string, icon: any, onPress: () => void) => {
        return (
            <TouchableOpacity
                onPress={() => onPress()}
                style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 5,
                    flexDirection: "row"
                    }}>
                <View style={{ marginLeft: 5, alignSelf: "center", flexDirection: "row" }}>
                    {/* TODO: Work on the color */}
                    <Avatar rounded size="medium" containerStyle={{ backgroundColor: "#7f8c8d" }} icon={icon} />
                </View>
                <View style={{ justifyContent: "center" }}>
                    <Text style={[material.headlineWhite, { color: "white", marginLeft: 10 }]}>{title}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    listRenderWraper = ({item}) => {
        if ("title" in item && "icon" in item)
            return this.renderButtonItem(item.title, item.icon, item.callback);
        
        return this.renderRosterItem(item);
    }

    render() {
        return (
            <View style={{ height: "100%", ...backgroundStyle(true) }}>
                <FlatHeader navigation={this.navigation} title="Start new chat" />
                <FlatList
                    data={this.extraEntries.concat(this.state.roster)}
                    key={this.state.key}
                    renderItem={item => this.listRenderWraper(item)}
                    keyExtractor={item => (item.jid + item.avatarUrl + (item.nickname || "")) || item.title} />
            </View>
        );
    }
};