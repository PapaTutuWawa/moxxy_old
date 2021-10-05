import React, { Component } from "react";
import {
    FlatList,
    TouchableOpacity,
    View
} from "react-native";
import { Avatar, Text, Badge, Icon } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { PresenceType } from "../../data/Presence";
import { User } from "../../data/User";
import { badgeStatus } from "../helpers";
import Conversation from "../../app/model/conversation";
import { Routes } from "../constants";

class ConversationsList extends Component {
    private navigation: any;
    private conversations: Conversation[];

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;
        this.conversations = props.conversationsList;
    }
    
    onItemPress(conversation: Conversation) {
        // NOTE: setParams is required for the Header to receive the route params
        //this.navigation.setParams({ user: user });
        this.navigation.navigate(Routes.CONVERSATION, { conversationJid: conversation.jid });
    };

    renderConversationItem = ({item}) => {
        item = item as Conversation;
        const avatarDisplayProps = item.avatarUrl ? {source: {uri: item.avatarUrl}} : {title: item.title[0].toUpperCase()};
        return (
                <TouchableOpacity
                // TODO: Fix
                    onPress={() => this.onItemPress(item)}
                    style={{ width: "100%", padding: 10, paddingRight: 30, marginTop: 5, flexDirection: "row" }}>
                    <View style={{ marginLeft: 5, alignSelf: "center", flexDirection: "row" }}>
                        <Avatar rounded size="medium" {...avatarDisplayProps} />
                        {/* item.presence !== PresenceType.OFFLINE && (
                            <Badge status={badgeStatus(item.presence)} containerStyle={{ position: "absolute", top: 2, right: 2 }} />
                        )*/}
                    </View>
                    <View>
                        <Text h4 style={{ color: "white", marginLeft: 10 }}>{item.title}</Text>
                        <Text
                            // TODO: If the message is too long, then the badge will overflow
                            style={{
                                color: "lightgray",
                                marginLeft: 10,
                                flex: 1,
                                fontWeight: item.lastMessageOOB ? "bold" : "normal"
                            }}
                            ellipsizeMode="tail"
                            numberOfLines={1}>{item.lastMessageText}</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    { item.unreadMessagesCount > 0 && (
                        <View style={{ justifyContent: "center", marginLeft: 10 }}>
                            <Badge
                                value={item.unreadMessagesCount} status="primary" />
                        </View>
                    )}
                </TouchableOpacity>
        );
    }

    render() {
        return <FlatList data={this.conversations} renderItem={this.renderConversationItem} keyExtractor={item => item.jid}></FlatList>
    }
};

export default function(props: any) {
    const navigation = useNavigation();

    return <ConversationsList {...props} navigation={navigation} />
}