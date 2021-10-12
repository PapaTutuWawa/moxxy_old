import React from 'react';
import {
    View, Image, TouchableOpacity
} from "react-native";
import { ConversationType } from '../../data/Conversation';
import { Message } from "../../app/model/message";
import { Corners } from "../../ui/constants";

// TODO: If it's the last bubble in the list, then it will be clipped by the view containing the input box
// TODO: Merge with ChatBubble
function GenericBubble(props: any) {
    const msg: Message = props.message;
    const type: ConversationType = props.type;
    const closerTogether = props.closerTogether;
    const between = props.between;
    const {start, end} = props;

    return (
        <View style={{
            flex: 1,
            width: "100%",
            // Put the bubble left or right depending on whether we
            // sent or received the message
            flexDirection: "row",
            justifyContent: msg.sent ? "flex-end" : "flex-start",
            // Space the bubbles depending on whether we succeed one of the same type (sent, received)
            // TODO(groupchat): Differentiate different GC senders
            paddingBottom: closerTogether ? 2 : 10,
            borderRadius: 10,
        }}>

            {
                !msg.sent && type == ConversationType.GROUPCHAT && (
                    // TODO(groupchats): Open the corresponding profile
                    // TODO(groupchats): Use the correct avatar url
                    <TouchableOpacity /*onPress={() => navigation.navigate("Profile", { user: msg.sender })}*/>
                        <Image
                            resizeMode="cover"
                            source={{ uri: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcdn-a.akamaihd.net%2Fsteamcommunity%2Fpublic%2Fimages%2Favatars%2F9f%2F9f32dbe284e4798ca06a19ac7fb5b6c396704451_full.jpg&f=1&nofb=1" }}
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 50,
                                marginRight: 10
                            }} />
                    </TouchableOpacity>
                )
            }

            <View style={{
                borderTopLeftRadius: !msg.sent && (between || end) && !(start && end) ? Corners.MESSGE_BUBBLE_GROUP : Corners.MESSAGE_BUBBLE_NORMAL,
                borderTopRightRadius: msg.sent && (between || end) && !(start && end) ? Corners.MESSGE_BUBBLE_GROUP : Corners.MESSAGE_BUBBLE_NORMAL,
                borderBottomLeftRadius: !msg.sent && (between || start) && !(start && end) ? Corners.MESSGE_BUBBLE_GROUP : Corners.MESSAGE_BUBBLE_NORMAL,
                borderBottomRightRadius: msg.sent && (between || start) && !(start && end)? Corners.MESSGE_BUBBLE_GROUP : Corners.MESSAGE_BUBBLE_NORMAL,
                // TODO: Maybe make this display-dependent
                maxWidth: 300,
                backgroundColor: msg.sent ? "#8e44ad" : "#2c3e50"
            }}>
                {props.children}
            </View>
            
            {
                msg.sent && type === ConversationType.GROUPCHAT && (
                    // TODO(groupchats): Use the correct avatar url
                    <Image
                        resizeMode="cover"
                        // TODO(groupchats)
                        source={{ uri: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcdn-a.akamaihd.net%2Fsteamcommunity%2Fpublic%2Fimages%2Favatars%2F9f%2F9f32dbe284e4798ca06a19ac7fb5b6c396704451_full.jpg&f=1&nofb=1" }}
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 50,
                            marginLeft: 10
                        }} />
                )
            }
        </View>
    );
}

export default GenericBubble;