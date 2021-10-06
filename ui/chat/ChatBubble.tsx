import React from "react";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements/dist/icons/Icon";
import { Image } from "react-native-elements";

import { MessageContentType, MessageEncryptionType } from "../../data/Message";
import Message from "../../app/model/message";
import GenericBubble from "./Bubble";
import { ConversationType } from "../../data/Conversation";
import { padNumber } from "../../ui/helpers";
import { Corners } from "../constants";

function getCornerRadiusStyle(sent: boolean, start: boolean, end: boolean, between: boolean) {
    return {
        borderTopLeftRadius: !sent && (between || end) && !(start && end) ? Corners.MESSGE_BUBBLE_GROUP : Corners.MESSAGE_BUBBLE_NORMAL,
        borderTopRightRadius: sent && (between || end) && !(start && end) ? Corners.MESSGE_BUBBLE_GROUP : Corners.MESSAGE_BUBBLE_NORMAL,
        borderBottomLeftRadius: !sent && (between || start) && !(start && end) ? Corners.MESSGE_BUBBLE_GROUP : Corners.MESSAGE_BUBBLE_NORMAL,
        borderBottomRightRadius: sent && (between || start) && !(start && end)? Corners.MESSGE_BUBBLE_GROUP : Corners.MESSAGE_BUBBLE_NORMAL,
    };
}

function renderMessageContent(message: Message, start: boolean, end: boolean, between: boolean) {
    if (message.isOOB()) {
        // Render as Image
        // TODO: Read the image URI from some cache
        // TODO: Handle also videos and generic files
        // TODO: Only accept HTTPS URLs
        // TODO: Use message.getContentType()
        return (
            <Image
                source={{ uri: message.oobUrl }}
                resizeMode="cover"
                style={{
                    ...getCornerRadiusStyle(message.sent, start, end, between),
                    height: 200,
                    width: 200,
                }} />
        );
    } else {
        // Just render the body
        return (
            <View style={{
                ...getCornerRadiusStyle(message.sent, start, end, between),
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

/**
 * Compute style attributes for the "bottom bar" of a message bubble
 */
function bubbleBottomStyle(msg: Message) {
    switch (msg.getContentType()) {
        case MessageContentType.IMAGE:
            return {
                position: "absolute",
                bottom: 5,
                right: 10,
            };
        default:
            return {
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 5,
            };
    }
}

// TODO: If we have an image, put a gradient (or something similar) below the timestamp
export default function ChatBubble(message: Message, type: ConversationType, closerTogether: boolean, between: boolean, start: boolean, end: boolean) {
    const date = new Date(message.timestamp);
    return (
        <GenericBubble
            message={message}
            closerTogether={closerTogether}
            between={between}
            start={start}
            end={end}>
            {wrapContent(renderMessageContent(message, start, end, between), message)}

            <View style={{
                flexDirection: "row",
                ...bubbleBottomStyle(message)
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