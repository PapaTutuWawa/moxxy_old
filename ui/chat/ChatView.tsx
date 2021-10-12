import React, { Component } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    FlatList
} from "react-native";
import { SpeedDial, Avatar, Text, Badge, Button } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { Input, Modal, Card } from "@ui-kitten/components";

import ChatBubble from "./ChatBubble";
import { PresenceType } from "../../data/Presence";
import { backgroundStyle, badgeStatus } from "../helpers";
import AppRepository from "../../app/Repository";
import { Message } from "../../app/model/message";
import { uuid } from "stanza/Utils";
import { MessageEncryptionType } from "../../data/Message";
import { Conversation } from "../../app/model/conversation";
import { Routes } from "../constants";
import { material } from "react-native-typography";
import FlatHeader from "../FlatHeader";

interface ChatViewState {
    presence: PresenceType;
    currentText: string;
    messages: Message[];
    speeddialOpen: boolean;
    key: number;
};

// TODO: Add "date pills" between days
// TODO: unreadCount does not get updated if List cannot scroll if not enough messages are present
class ChatView extends Component {
    state: ChatViewState;
    private navigation: any;
    private background: any
    private conversation: Conversation;
    private conversationJid: string;
    private messageList: FlatList;
    // TODO
    private jumpToEnd: boolean;
    private firstLoadDone: boolean;

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;
        this.background = props.background;
        this.jumpToEnd = false;
        this.firstLoadDone = false;

        this.state = {
            presence: PresenceType.AWAY,
            currentText: "",
            messages: [],
            speeddialOpen: false,
            key: 0
        };

        this.conversationJid = props.route.params.conversationJid;
        AppRepository.getInstance().getConversationCache()
            .getConversationByJid(this.conversationJid)
            .then(conversation => {
                if (!conversation.hasValue()) {
                    console.log(`ChatView::constructor: No conversation for ${this.conversationJid}!`);
                    return;
                }
        
                this.conversation = conversation.getValue();
            })
            .then(() => {
                const mc = AppRepository.getInstance().getMessageCache();
                mc.getMessages(this.conversation.jid)
                    .then(messages => {
                        this.setState({
                            messages
                        });
                        this.firstLoadDone = true;
                    });
                mc.on("messageAdd", this.onNewMessage);
                AppRepository.getInstance().setOpenConversationJid(this.conversation.jid);
                AppRepository.getInstance().getConversationCache().on("conversationUpdated", this.onConversationUpdate);
            });
    }

    componentWillUnmount = () => {
        AppRepository.getInstance().getMessageCache().removeListener("messageAdd", this.onNewMessage);
        AppRepository.getInstance().getConversationCache().removeListener("conversationUpdated", this.onConversationUpdate);
        AppRepository.getInstance().resetOpenConversationJid();
    }

    onConversationUpdate = (conversation) => {
        if (conversation.jid !== this.conversationJid)
            return;
            
        this.conversation = conversation;
        // TODO: Put conversation into the state
        this.forceUpdate();
    }

    onKeyPress(text: string) {
        this.setState({
            currentText: text
        });
    }

    onListLayoutChange = () => {
        if (this.firstLoadDone) {
            this.messageList.scrollToEnd({ animated: false });
            this.jumpToEnd = true;
            if (this.conversation.unreadMessagesCount > 0)
                AppRepository.getInstance().getConversationCache().markAsRead(this.conversationJid);
        } else if (this.firstLoadDone && this.jumpToEnd) {
            this.messageList.scrollToEnd({ animated: true });
        }
    }

    onNewMessage = (msg: Message) => {
        if (msg.sentIn !== this.conversation.jid)
            return;
    
        this.setState({
            messages: this.state.messages.concat([msg]),
            key: this.state.key + 1
        });
    }

    sendMessage() {
        if (this.state.currentText === "") return;
        
        const body = this.state.currentText;
        const timestamp = new Date().getTime();
        const threadId = uuid();
        const msg: Message = {
            body,
            sentIn: this.conversation.jid,
            timestamp: new Date().getTime(),
            sent: true,
            stanzaId: uuid(),
            encryption: MessageEncryptionType.NONE, // TODO
            oobUrl: "", // TODO
            threadId: threadId,
        };
        AppRepository.getInstance().getMessageCache()
            .addMessage(msg)
            .then(async () => {
                // TODO: OOB
                // TODO: This needs to go through the ConversationCache
                await this.conversation.updateLastMessage(body, timestamp, false, "", false, true);
            });
        AppRepository.getInstance().getXMPPClient()
            .sendMessage({
                to: this.conversation.jid,
                body: body,
                thread: threadId
            });
        this.setState({
            currentText: ""
        });
    }

    onListEndReached = (info: any) => {
        console.log("onListEndReached");
        this.jumpToEnd = true;

        if (this.conversation.unreadMessagesCount > 0) {
            console.log("Setting unread messages to 0");
            AppRepository.getInstance().getConversationCache()
                .markAsRead(this.conversation.jid);
        }
    }

    toggleSpeeddial = () => {
        if (this.state.currentText.length > 0) {
            this.sendMessage();
        } else {
            this.setState({
                speeddialOpen: !this.state.speeddialOpen
            });
        }
    };

    renderBubble = ({item, index}) => {
        // TODO: Check if only visible items get immediately rendered. If so, send a read marker
        //       when rendered and not yet marked as read
        const start = index - 1 < 0 ? true : this.state.messages[index - 1].sent !== item.sent;
        const end = index + 1 >= this.state.messages.length ? true : this.state.messages[index + 1].sent !== item.sent;
        const between = !start && !end;

        return ChatBubble(item, this.conversation.type, !end, between, start, end);
    }

    renderEmptyList = () => {
        const avatarDisplayProps = this.conversation && this.conversation.avatarUrl ? {source: { uri: this.conversation.avatarUrl }} : {title: this.conversationJid[0]};
        return (
            <View>
                <View style={{ flexDirection: "row", justifyContent: "center" }}>
                    <TouchableOpacity onPress={() => this.navigation.navigate(Routes.PROFILE, { conversationJid: this.conversationJid })}>
                        <Avatar rounded size="xlarge" {...avatarDisplayProps} />
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center" }}>
                    <Text style={[material.headlineWhite]}>No messages yet...</Text>
                </View>
            </View>
        );
    }

    // TODO: Handle scroll position resetting when state.messages changes
    // TODO: Show the block or add contact buttons if the JID is not in the roster
    render() {
        if (this.conversation && this.conversation.avatarUrl === "" && this.conversation.hasAvatar) {
            AppRepository.getInstance().requestAndSetAvatar(this.conversationJid, "conversation");
        }

        const title = this.conversation && this.conversation.title ? this.conversation.title : "";
        const avatarDisplayProps = this.conversation && this.conversation.avatarUrl ? {source: { uri: this.conversation.avatarUrl }} : {title: this.conversationJid[0]};

        return (
            <View style={{ height: "100%", ...this.background }}>
                <FlatHeader navigation={this.navigation}>
                    <View style={{ alignSelf: "center", flex: 1 }}>
                        <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => this.navigation.navigate(Routes.PROFILE, { conversationJid: this.conversationJid })}>
                            <View>
                                <Avatar rounded size="small" {...avatarDisplayProps} />
                                { /*user.presence !== PresenceType.OFFLINE && (
                                    <Badge status={badgeStatus(user.presence)} containerStyle={{ position: "absolute", top: 2, right: 2 }} />
                                )*/}
                            </View>
                            <View style={{ marginLeft: 10, justifyContent: "center" }}>
                                <Text style={[material.headlineWhite]}>{title}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </FlatHeader>

                {/*<View style={{ flexDirection: "row", justifyContent: "center", paddingLeft: 20, paddingRight: 20 }}>
                    <View style={{ flex: 1 }}>
                        <Button title="Add contact" />
                    </View>
                    
                    <View style={{ flex: 1, marginLeft: 20 }}>
                        <Button title="Block" />
                    </View>
                </View>*/}

                <FlatList
                    style={{ padding: 10 }}
                    data={this.state.messages}
                    renderItem={this.renderBubble}
                    keyExtractor={item => item.body + item.timestamp + item.stanzaId}
                    showsVerticalScrollIndicator={false}
                    ref={ref => this.messageList = ref}
                    key={this.state.key}
                    ListEmptyComponent={this.renderEmptyList()}
                    // TODO: Begin
                    onContentSizeChange={() => this.onListLayoutChange()}
                    onLayout={() => this.onListLayoutChange()}
                    // TODO: End
                    onEndReached={this.onListEndReached} />
                <View style={{
                    flexDirection: "row",
                    padding: 10,
                    backgroundColor: "transparent"
                }}>
                    <View style={{ flexDirection: "column", justifyContent: "center", flex: 1, marginRight: 60, marginBottom: 5 }}>
                        <Input
                            placeholder="Message"
                            value={this.state.currentText}
                            onChangeText={text => this.onKeyPress(text)}
                            onSubmitEditing={() => this.sendMessage()} />
                    </View>
                    {/* TODO: The margins look pretty sus */}
                    <SpeedDial
                        isOpen={this.state.speeddialOpen}
                        icon={{ name: this.state.currentText.length === 0 ? "add" : "send", color: '#fff' }}
                        openIcon={{ name: 'close', color: '#fff' }}
                        onOpen={() => this.toggleSpeeddial()}
                        onClose={() => this.toggleSpeeddial()}
                        size="small">
                        <SpeedDial.Action
                            icon={{ "name": "photo", color: "#fff" }}
                            title="Gallery"
                            onPress={() => console.log('Add Image')}  />
                        { /* TODO: Fix icon
                        <SpeedDial.Action
                            icon={{ name: 'pen', color: '#fff' }}
                            title="Files"
                            onPress={() => console.log('Add File')}  /> */ }
                    </SpeedDial>
                </View>
            </View>
        );
    }
};

export function ChatViewWrapper(props: any) {
    const navigation = useNavigation();
    //const background = backgroundStyle(useColorScheme() === "dark");
    const background = backgroundStyle(true);

    return (
            <ChatView { ...props } background={background} navigation={navigation} />
    );
}