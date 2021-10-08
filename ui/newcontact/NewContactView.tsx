import { Input } from "@ui-kitten/components";
import { Button, Icon } from "react-native-elements";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import FlatHeader from "../FlatHeader";
import { backgroundStyle } from "../helpers";
import AppRepository from "../../app/Repository";
import { ConversationType } from "../../data/Conversation";
import { Routes } from "../constants";

interface NewContactViewState {
    jid: string;
    canAdd: boolean;
    waiting: boolean;
};

export default class NewContactView extends React.Component {
    state: NewContactViewState;
    private navigation: any;

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;

        this.state = {
            jid: "",
            canAdd: false,
            waiting: false
        };
    }
    
    updateJid = (jid: string) => {
        this.setState({
            jid,
            // TODO: Maybe not
            canAdd: jid.length > 0 && jid.indexOf("@") !== -1
        });
    }

    addContact = () => {
        if (this.state.waiting)
            return;

        this.setState({
            waiting: true
        });

        AppRepository.getInstance()
            .addRosterItem(this.state.jid)
            .then(() => {
                AppRepository.getInstance().getXMPPClient().sendPresence({
                    to: this.state.jid,
                    type: "subscribe"
                });
                AppRepository.getInstance().getConversationCache()
                    .addConversation({
                        avatarUrl: "",
                        jid: this.state.jid,
                        lastMessageText: "",
                        lastMessageTimestamp: 0,
                        unreadMessagesCount: 0,
                        title: this.state.jid.split("@")[0],
                        type: ConversationType.DIRECT
                    }, (conversation) => {
                        this.navigation.reset({
                            index: 1,
                            routes: [
                                { name: Routes.CONVERSATIONLIST },
                                { name: Routes.CONVERSATION, params: { conversationJid: this.state.jid } }
                            ]
                        });
                    });
            });
    }

    // TODO: Find a library to decode QR codes and detect both xmpp:user@server and user@server
    renderQRIcon = (props: any) => {
        return (
            <TouchableOpacity onPress={() => {}}>
                <Icon name="qr-code" type="ionicon" color="#ffffff" />
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <View style={{ height: "100%", ...backgroundStyle(true) }}>
                <FlatHeader navigation={this.navigation} title="Add new Contact" />

                <View style={{ flexDirection: "row", justifyContent: "center" }}>
                    <Input
                        style={{ width: "80%" }}
                        placeholder="XMPP-Address"
                        value={this.state.jid}
                        disabled={this.state.waiting}
                        onChangeText={this.updateJid}
                        accessoryRight={this.renderQRIcon} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
                    <View style={{ width: "80%"}}>
                        <Button
                            disabled={!this.state.canAdd}
                            loading={this.state.waiting}
                            onPress={this.addContact}
                            title="Add contact" />
                    </View>
                </View>
            </View>
        );
    }
};