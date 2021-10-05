import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { Text, Avatar } from "react-native-elements";
import { useNavigation  } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { User } from "../../data/User";
import { backgroundStyle, hack__bareJid } from "../helpers";
import AppRepository from "../../app/Repository";
import { ConversationType } from "../../data/Conversation";
import { PresenceType } from "../../data/Presence";
import { Routes } from "../constants";
import RosterItem from "../../app/storage/rosteritem";

const Tab = createMaterialTopTabNavigator();

// TODO(groupchat)
function renderGroupchatItem({item}) {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            onPress={() => {}}
            style={{ width: "100%", padding: 10, marginTop: 5, flexDirection: "row" }}>
            <View style={{ marginLeft: 5, alignSelf: "center", flexDirection: "row" }}>
                <Avatar rounded size="medium" source={{ uri: item.avatarUrl }} />
            </View>
            <View>
                <Text h4 style={{ color: "white", marginLeft: 10 }}>{item.roomName}</Text>
            </View>
        </TouchableOpacity>
    );
}

function ContactList(props: any) {
    const navigation = useNavigation();

}

function GroupchatList(props: any) {
    return (
        <View style={{ height: "100%", ...backgroundStyle(true) }}>
            <FlatList
                style={{ padding: 10 }}
                data={props.groupchats}
                renderItem={renderGroupchatItem}
                keyExtractor={item => item.jid} />
        </View>
    );
}


function ContactListWrapper(roster: User[]) {
    return (props: any) => {
        return ContactList({ ...props, roster: roster });
    };
}

function GroupchatListWrapper(groupchats: any[]) {
    return (props: any) => {
        return GroupchatList({ ...props, groupchats: groupchats });
    };
}

interface RosterListWrapperState {
    roster: RosterItem[];
    key: number;
};

class RosterListWrapper extends React.Component {
    state: RosterListWrapperState;
    private navigation: any;

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;

        this.state = {
            roster: [],
            key: 0
        };

        AppRepository.getInstance().getRosterCache().on("rosterSet", this.setRoster);
        AppRepository.getInstance().getRosterCache().getRoster().then(this.setRoster);
    }

    setRoster = (roster: RosterItem[]) => {
        this.setState({
            roster,
            key: this.state.key + 1
        });
    }

    componentWillUnmount = () => {
        AppRepository.getInstance().getRosterCache().removeListener("rosterSet", this.setRoster);
    }

    renderRosterItem = (item: RosterItem) => {
        return (
            <TouchableOpacity
                onPress={async () => {
                    // TODO: This is broken
                    /*if (AppRepository.getInstance().getConversationCache().hasConversation(item.jid)) {
                        // TODO: Just open the conversation
                        return;
                    }*/

                    AppRepository.getInstance().getConversationCache()
                        .addConversation({
                            avatarUrl: item.avatarUrl,
                            jid: item.jid,
                            lastMessageText: "",
                            unreadMessagesCount: 0,
                            title: item.nickname ? item.nickname : item.jid.split("@")[0], // TODO: Check the split stuff
                            type: ConversationType.DIRECT
                        }, (conversation) => {
                            this.navigation.reset({
                                index: 0,
                                routes: [
                                    // TODO: We're not being sent to the chat
                                    { name: Routes.CONVERSATIONLIST },
                                    { name: Routes.CONVERSATIONLIST, params: { conversation } }
                                ]
                            });
                        });
                }}
                style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 5,
                    flexDirection: "row"
                    }}>
                <View style={{ marginLeft: 5, alignSelf: "center", flexDirection: "row" }}>
                    <Avatar rounded size="medium" source={{ uri: item.avatarUrl }} />
                </View>
                <View>
                    {/* TODO: Make this split stuff nicer */}
                    <Text h4 style={{ color: "white", marginLeft: 10 }}>{item.nickname || hack__bareJid(item.jid).split("@")[0]}</Text>
                    <Text style={{ color: "white", marginLeft: 10 }}>{item.jid}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <View style={{ height: "100%", ...backgroundStyle(true) }}>
                <FlatList
                    style={{ padding: 10 }}
                    data={this.state.roster}
                    key={this.state.key}
                    renderItem={({item}) => this.renderRosterItem(item)}
                    keyExtractor={item => item.jid} />
            </View>
        );
    }
};

export default class NewChatView extends React.Component {
    constructor(props: any) {
        super(props);
    }

    render() {
        // TODO: Maybe remove the navigator and *just* add a searchbar
        return (
            <Tab.Navigator>
                <Tab.Screen name="Contacts" component={RosterListWrapper} />
                <Tab.Screen name="Groupchats" component={GroupchatListWrapper([])}/>
            </Tab.Navigator>
        );
    }
};