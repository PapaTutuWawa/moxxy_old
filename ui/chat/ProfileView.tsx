import React from "react";
import { View, Image, Text, ActivityIndicator } from "react-native";
import Conversation from "../../app/model/conversation";
import { backgroundStyle } from "../helpers";
import { material } from "react-native-typography";
import AppRepository from "../../app/Repository";
import FlatHeader from "../FlatHeader";

// TODO: Show different things based on whether we come from a DM chat or GC. Also differentiate between
//       other users and ourself
export default class ConversationProfileView extends React.Component {
    private conversationJid: string;
    private navigation: any;
    state: { conversation: Conversation | null };

    constructor(props: any) {
        super(props);

        this.conversationJid = props.route.params.conversationJid;
        this.navigation = props.navigation;

        this.state = {
            conversation: null
        };

        AppRepository.getInstance().getConversationCache()
            .getConversationByJid(this.conversationJid)
            .then(conversation => {
                this.setState({
                    conversation
                });
            });
    }

    renderLoading = () => {
        return (
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}>
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator size="large" />
                </View>
            </View>
        );
    }

    renderConversation = () => {
        return (
            <>
                <View style={{ flexDirection: "row" }}>
                    <FlatHeader navigation={this.navigation} fullWidth={false} />
                    <View style={{ flexDirection: "row", justifyContent: "center", width: "100%", paddingTop: 10 }}>
                        <Image
                            source={{ uri: this.state.conversation.avatarUrl}}
                            resizeMode="cover"
                            style={{
                                height: 160,
                                width: 160,
                                borderTopRightRadius: 75,
                                borderTopLeftRadius: 75,
                                borderBottomLeftRadius: 75,
                                borderBottomRightRadius: 75
                            }} />
                    </View>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "center"}}>  
                    <Text style={material.headlineWhite}>{this.state.conversation.title}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center" }}>  
                    <Text style={material.subheadingWhite}>{this.state.conversation.jid}</Text>
                </View>
            </>
        );
    }

    render() {
        return (
            <View style={{ height: "100%", ...backgroundStyle(true)}}>
                { this.state.conversation ? this.renderConversation() : this.renderLoading() }
            </View>
        );
    }
};