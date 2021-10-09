import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";
import { Avatar, FAB, Text } from "react-native-elements";

import Conversation from "../../app/model/conversation";

import { backgroundStyle } from "../helpers";
import ConversationsList from "./ConversationsList";
import { PresenceType } from "../../data/Presence";
import AppRepository from "../../app/Repository";
import { Routes } from "../constants";
import FlatHeader from "../FlatHeader";
import { material } from "react-native-typography";
import { Icon } from "@ui-kitten/components";

interface ConversationsViewState {
    conversations: Conversation[];
    key: number;
    avatarUrl: string;
    avatarKey: number;
};

export default class ConversationsView extends Component {
    private navigation: any;
    private jid: string;
    state: ConversationsViewState;

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;
        this.jid = AppRepository.getInstance().getUserData().jid;

        this.state = {
            conversations: [],
            key: 0,
            avatarUrl: AppRepository.getInstance().getUserData().avatarUrl,
            avatarKey: 0
        };

        this.onUpdateConversation(null);
        AppRepository.getInstance().getConversationCache().on("conversationAdd", this.onNewConversation);
        AppRepository.getInstance().getConversationCache().on("conversationUpdated", this.onUpdateConversation);
        AppRepository.getInstance().getAvatarCache().on("avatarSaved", this.onAvatarSaved);
    }

    onAvatarSaved = ({jid, path}) => {
        if (jid !== this.jid) {
            this.forceUpdate();
            return;
        }
        
        this.setState({
            avatarUrl: `file://${path}?${this.state.avatarKey + 1}`,
            avatarKey: this.state.avatarKey + 1
        });
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
        AppRepository.getInstance().getAvatarCache().removeListener("avatarSaved", this.onAvatarSaved);
    }

    render() {
        const avatarDisplayProps = this.state.avatarUrl ? {source: { uri: this.state.avatarUrl }} : {title: this.jid[0]};
        return (
            <View style={{ height: "100%", ...backgroundStyle() }}>
                {/* TODO: Header content is not centered */}
                <FlatHeader navigation={this.navigation} showBackButton={false}>
                    <View style={{ justifyContent: "center", marginLeft: 10 }}>
                        <TouchableOpacity onPress={() => this.navigation.navigate(Routes.SELFPROFILE)}>
                            <Avatar rounded size="small" overlayContainerStyle={{backgroundColor: 'gray'}} {...avatarDisplayProps} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ justifyContent: "center" }}>
                        <Text style={[material.headlineWhite, {marginLeft: 10 }]}>Moxxy</Text>
                    </View>
                    {/* TODO: Put own avatar in the FlatHeader which redirects to your own profile page */}
                    <View style={{ flex: 1}} />
                    <View style={{ justifyContent: "center", marginRight: 10 }}>
                        <TouchableOpacity
                            onPress={() => this.navigation.navigate(Routes.SETTINGS)}>
                                <Icon style={{ width: 28, height: 28 }} name="more-vertical" fill="#fff" />
                        </TouchableOpacity>
                    </View>
                </FlatHeader>
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