import React from "react";

import {
    FlatList
} from "react-native";
import { Message, MessageContentType, MessageType } from "../../data/Message";
import ChatBubble from "./ChatBubble";

export interface ChatMessagesProps {
    messages: Message[];
    key: number;
    showImageModal: (msg: Message) => void;
};

export class ChatMessages extends React.Component {
    private messages: Message[];
    private messageId: number = 0;
    private showImageModal: (msg: Message) => void;

    constructor(props: ChatMessagesProps) {
        super(props);
        this.messages = props.messages;
        this.showImageModal = props.showImageModal;
    }

    renderBubble = ({item}) => {
        switch (item.type) {
            case MessageType.MESSAGE_CHAT:
            case MessageType.MESSAGE_GROUPCHAT:
                return ChatBubble(item, this.showImageModal);
        }
    }

    render() {
        return (
            <FlatList
                style={{ padding: 10 }}
                data={this.messages}
                renderItem={this.renderBubble}
                keyExtractor={item => item.content}
                showsVerticalScrollIndicator={false} />
        );
    };
};