import React, { Component } from "react";
import { View } from "react-native";
import { FAB } from "react-native-elements";

import Conversation from "../../app/model/conversation";

import { backgroundStyle } from "../helpers";
import ConversationsList from "./ConversationsList";
import { PresenceType } from "../../data/Presence";
import AppRepository from "../../app/Repository";
import { User } from "../../data/User";
import { Routes } from "../constants";

interface ConversationsViewState {
    conversations: Conversation[];
    key: number;
};

// TODO: Replace header bar with FlatHeader
export default class ConversationsView extends Component {
    state: ConversationsViewState;
    private navigation: any;

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;

        this.state = {
            conversations: [],
            key: 0
        };

        this.onUpdateConversation(null);
        AppRepository.getInstance().getConversationCache().on("conversationAdd", this.onNewConversation);
        AppRepository.getInstance().getConversationCache().on("conversationUpdated", this.onUpdateConversation);
    }

    onNewConversation = (conversation: Conversation) => {
        this.setState({
            conversations: this.state.conversations.concat(conversation),
            key: this.state.key + 1
        });
    }

    onUpdateConversation = (conversation: Conversation) => {
        AppRepository.getInstance().getConversationCache()
            .getConversations()
            .then(conversations => {
                this.setState({
                    conversations,
                    key: this.state.key + 1
                })
            });
    }

    componentWillUnmount = () => {
        AppRepository.getInstance().getConversationCache().removeListener("conversationAdd", this.onNewConversation);
        AppRepository.getInstance().getConversationCache().removeListener("conversationUpdated", this.onUpdateConversation);
    }

    render() {
        return (
            <View style={{ height: "100%", ...backgroundStyle() }}>
                <ConversationsList conversationsList={this.state.conversations} key={this.state.key} />
                <FAB
                    placement="right" size="large" icon={{
                        type: "font-awesome",
                        name: "pencil",
                        color: "white"
                    }}
                    onPress={() => this.navigation.navigate(Routes.NEWCONVERSATION)} />
            </View>
        );
    }
};