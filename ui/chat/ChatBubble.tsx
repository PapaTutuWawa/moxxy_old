import React from "react";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements/dist/icons/Icon";
import { Image } from "react-native-elements";

import { MessageContentType, MessageEncryptionType } from "../../data/Message";
import Message from "../../app/model/message";
import GenericBubble from "./Bubble";
import { ConversationType } from "../../data/Conversation";
import { padNumber } from "../../ui/helpers";

function renderMessageContent(message: Message) {
    if (message.isOOB()) {
        // Render as Image
        // TODO: Read the image URI from some cache
        // TODO: Handle also videos and generic files
        // TODO: Only accept HTTPS URLs
        return (
            <Image
                source={{ uri: message.oobUrl }}
                resizeMode="cover"
                style={{
                    height: 200,
                    width: 200,
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10,
                }} />
        );
    } else {
        // Just render the body
        return (
            <View style={{
                borderTopRightRadius: 15,
                borderTopLeftRadius: 15,
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 5
                }}>
                <Text style={{ color: "white" }}>{message.body}</Text>
            </View>
        );
    }
}

function wrapContent(content: any, msg: Message) {
    // TODO
    if (false /*msg.contentType === MessageContentType.IMAGE*/) {
        return (
            // TODO: Just open the image in the gallery
            <TouchableOpacity onPress={() => {}}>
                {content}
            </TouchableOpacity>
        );
    } else {
        return content;
    }
}

export default function ChatBubble(message: Message, type: ConversationType, closerTogether: boolean, between: boolean, start: boolean, end: boolean) {
    const date = new Date(message.timestamp);
    return (
        <GenericBubble
            message={message}
            closerTogether={closerTogether}
            between={between}
            start={start}
            end={end}>
            {wrapContent(renderMessageContent(message), message)}

            <View style={{
                flexDirection: "row",
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 5,
                paddingTop: 5
            }}>
                {
                    type === ConversationType.GROUPCHAT && (
                        <Text style={{
                            alignSelf: "flex-start",
                            marginRight: 10,
                            color: "darkgray"
                            // TODO
                        }}>Atago-San</Text>
                    )
                }

                <View style={{ flex: 1}} />
                <Text style={{
                    color: "darkgray"
                    // TODO: Pad the values to 9:04, instead of 9:4
                }}>{`${date.getHours()}:${padNumber(date.getMinutes())}`}</Text>

                {
                    message.encryption != MessageEncryptionType.NONE && (
                        <Icon style={{
                            marginLeft: 5
                        }} size={16} name="lock" />
                    )
                }
            </View>
        </GenericBubble>
    );
};