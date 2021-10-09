import React from "react";
import { View, Image, Text, ActivityIndicator } from "react-native";
import Conversation from "../../app/model/conversation";
import { backgroundStyle } from "../helpers";
import { material } from "react-native-typography";
import AppRepository from "../../app/Repository";
import FlatHeader from "../FlatHeader";
import { Button, Icon } from "@ui-kitten/components";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Routes } from "../constants";
import Maybe from "../../app/types/maybe";
import { Avatar } from "react-native-elements";

interface ConversationProfileViewState {
    conversation: Conversation | null;
    inRoster: Maybe<boolean>;
}

// TODO: Show different things based on whether we come from a DM chat or GC. Also differentiate between
//       other users and ourself
export default class ConversationProfileView extends React.Component {
    private conversationJid: string;
    private navigation: any;
    // TODO: Use Maybe<Conversation>
    state: ConversationProfileViewState;

    constructor(props: any) {
        super(props);

        this.conversationJid = props.route.params.conversationJid;
        this.navigation = props.navigation;

        this.state = {
            conversation: null,
            inRoster: new Maybe()
        };

        AppRepository.getInstance().getConversationCache()
            .getConversationByJid(this.conversationJid)
            .then(conversation => {
                if (!conversation.hasValue()) {
                    console.log(`ProfileView::constructor: No conversation for ${this.conversationJid}!`);
                    return;
                }
        
                this.setState({
                    conversation: conversation.getValue()
                });

                AppRepository.getInstance().getConversationCache().on("conversationUpdated", this.onConversationUpdated);
            });
        AppRepository.getInstance().getRosterCache()
            .getRoster()
            .then((roster) => {
                this.setState({
                    inRoster: new Maybe(AppRepository.getInstance().getRosterCache().inRoster(this.conversationJid)),
                });
            });
    }

    onConversationUpdated = (conversation) => {
        this.setState({
            conversation
        });
    }

    componentWillUnmount = () => {
        AppRepository.getInstance().getConversationCache().removeListener("conversationUpdated", this.onConversationUpdated);
    }

    renderMediaList = () => {
        const renderMedium = (url: string) => {
            // TODO: Not working?
            return (
                <TouchableOpacity onPress={() => { console.log(`Opening ${url}`)}} key={url}>
                    <Image
                        source={{ uri: url }}
                        resizeMode="cover"
                        style={{ height: 70, width: 70, borderRadius: 3, margin: 3 }} />
                </TouchableOpacity>
            );
        };

        const listLength = this.state.conversation.media.length; 
        return (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {
                    this.state.conversation.media.filter((_, index) => index < 8).map((mediaUrl, index) => {
                        // TODO: Refactor this. It looks ugly
                        if (index < 7)
                            return renderMedium(mediaUrl);
                        else
                            if (listLength > 8)
                                return (
                                    <View style={{ margin: 3}} key={mediaUrl}>
                                        { renderMedium(mediaUrl) }
                                        <View style={{ position: "absolute", borderRadius: 3, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.7)", flexDirection: "row", justifyContent: "center" }}>
                                            <View style={{ justifyContent: "center" }}>
                                                <Text style={[material.headlineWhite]}>{`+${listLength - 8}`}</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            else
                                return renderMedium(mediaUrl);      
                    })
                }
            </View>
        );
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

    closeConversation = async () => {
        await AppRepository.getInstance().getConversationCache().setConversationOpen(this.conversationJid, false);
        this.navigation.reset({
            index: 0,
            routes: [
                { name: Routes.CONVERSATIONLIST}
            ]
        });
    }

    renderConversation = () => {
        return (
            <>
                <View style={{ flexDirection: "row" }}>
                    <FlatHeader navigation={this.navigation} fullWidth={false} />
                    <View style={{ flexDirection: "row", justifyContent: "center", width: "100%", paddingTop: 10 }}>
                        <Avatar
                            rounded
                            size="xlarge"
                            source={{ uri: this.state.conversation.avatarUrl }} />
                    </View>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "center"}}>  
                    <Text style={material.headlineWhite}>{this.state.conversation.title}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center" }}>  
                    <Text style={material.subheadingWhite}>{this.state.conversation.jid}</Text>
                </View>

                {
                    this.state.conversation && this.state.conversation.media.length > 0 && (
                        <>
                            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
                                <View style={{ width: "80%" }}>
                                    <Text style={[material.subheadingWhite]}>Shared media</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "center" }}>
                                <View style={{ width: "80%" }}>
                                    {this.renderMediaList()}
                                </View>
                            </View>
                        </>
                    )
                }

                <View style={{ flex: 1}} />

                {/* TODO: Implement*/}
                {/* TODO: Make this look prettier */}
                {
                    this.state.inRoster.hasValue() && (
                        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>  
                            <View style={{ width: "80%" }}>
                                <Button
                                    status="basic"
                                    appearance="ghost"
                                    accessoryLeft={props => <Icon {...props} name="person-delete" />}
                                    onPress={() => {}}>
                                    {
                                        this.state.inRoster.getValue() ? "Remove as contact" : "Add as contact"
                                    }
                                </Button>
                            </View>
                        </View>
                    )
                }

                <View style={{ flexDirection: "row", justifyContent: "center" }}>  
                    <View style={{ width: "80%" }}>
                        <Button
                            status="warning"
                            appearance="ghost"
                            accessoryLeft={props => <Icon {...props} name="close" />}
                            onPress={this.closeConversation}>
                            Close chat
                        </Button>
                    </View>
                </View>

                {/* TODO: Implement*/}
                <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>  
                    <View style={{ width: "80%" }}>
                        <Button
                            status="danger"
                            accessoryLeft={props => <Icon {...props} name="slash" />}
                            appearance="ghost">
                            Block
                        </Button>
                    </View>
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