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
import { badgeStatus, padNumber } from "../helpers";
import Conversation from "../../app/model/conversation";
import { Routes } from "../constants";

/**
 * Formats a timestamp for a last message to either "12h", if the time since the last message
 * is less than 24h to the time of calling this function or "23.09", if greater.
 */
function lastMessageTimestampText(timestamp: number): string {
    const now = Date.now();
    const minuteDifference = (now - timestamp) / (1000 * 60);

    if (minuteDifference > 60) {
        const hourDifference = Math.round(minuteDifference / 60);
        if (minuteDifference / 60 > 24) {
            const date = new Date(timestamp);
            const paddedDay = padNumber(date.getDay());
            const paddedMonth = padNumber(date.getMonth());
            return `${paddedDay}:${paddedMonth}`;
        } else {
            return `${hourDifference}h`
        }
    } else if (minuteDifference < 1) {
        return `Just now`;
    }

    return `${Math.round(minuteDifference)} min`;
}

class ConversationsList extends Component {
    private navigation: any;
    private conversations: Conversation[];
    private refreshTimer: number;

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;
        this.conversations = props.conversationsList;
        this.refreshTimer = setTimeout(() => {
            this.forceUpdate();
        }, 60 * 1000);
    }
    
    componentWillUnmount = () => {
        clearTimeout(this.refreshTimer);
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
                        <Text style={{
                                color: "lightgray",
                                marginLeft: 10,
                                flex: 1,
                                fontWeight: item.lastMessageOOB ? "bold" : "normal",
                                maxWidth: 280
                            }}
                            ellipsizeMode="tail"
                            numberOfLines={1}>{item.lastMessageText}</Text>
                    </View>

                    <View style={{ flex: 1 }} />
                    <View style={{ paddingTop: 2 }}>
                        {/* TODO: Calculate the time difference */}
                        { item.lastMessageText !== "" && <Text style={{ color: "lightgray" }}>{lastMessageTimestampText(item.lastMessageTimestamp)}</Text> }
                        { item.unreadMessagesCount > 0 && (
                                <Badge
                                    containerStyle={{ paddingTop: 5 }}
                                    value={item.unreadMessagesCount} status="primary" />
                        )}
                    </View>
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