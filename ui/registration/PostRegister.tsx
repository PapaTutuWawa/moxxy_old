import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Button, Text, Avatar } from "react-native-elements";
import { material } from "react-native-typography";
import Collapsible from "react-native-collapsible";
import { Toggle } from "@ui-kitten/components";
import { backgroundStyle } from "../helpers";
import { Routes } from "../constants";

interface PostRegisterComponentState {
    showPassword: boolean;
    showSettings: boolean;
}

export default class PostRegisterComponent extends React.Component {
    state: PostRegisterComponentState;
    private username: string;
    private jid: string;
    private navigation: any;

    constructor(props: any) {
        super(props);

        const params = props.route.params;
        this.username = params.username;
        this.jid = params.jid;
        this.navigation = props.navigation;

        this.state = {
            showPassword: false,
            showSettings: false
        }
    }

    togglePassword = () => {
        this.setState({
            showPassword: !this.state.showPassword
        })
    }

    toggleSettings = () => {
        this.setState({
            showSettings: !this.state.showSettings
        })
    }

    render() {
        return (
            <View style={{ height: "100%", padding: 60, ...backgroundStyle(true) }}>
                <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 10 }}>
                    <Text style={material.display2White}>This is you!</Text>
                </View>
                <TouchableOpacity onPress={() => {}}>
                    <View style={{ flexDirection: "row" }}>
                            <View style={{ marginLeft: 5, alignSelf: "center", flexDirection: "row" }}>
                                <Avatar rounded size="medium" overlayContainerStyle={{backgroundColor: 'gray'}} title={this.username[0]}>
                                    {/* TODO: Maybe work on the size of the icon */}
                                    <Avatar.Accessory type="font-awesome" name="pencil" color="white" size={16}/>
                                </Avatar>
                            </View>
                            <View>
                                <Text h4 style={{ color: "white", marginLeft: 10 }}>{this.username}</Text>
                                <Text style={{ color: "white", marginLeft: 10 }}>{this.jid}</Text>
                            </View>
                    </View>
                </TouchableOpacity>

                <View style={{ padding: 15 }}>
                    <Text style={[material.body1White, { marginBottom: 10 }]}>We have auto-generated a password for you. You should write it down somewhere safe.</Text>

                    <Button type="clear" title="Show password" onPress={() => this.togglePassword()}/>
                    <Collapsible collapsed={!this.state.showPassword}>
                        <View style={{ flexDirection: "row", justifyContent: "center" }}>
                            <Text style={material.body1White}>abc123Welt</Text>
                        </View>
                    </Collapsible>

                    <View style={{ marginTop: 15 }}>
                        <Button type="clear" style={{ marginTop: 15 }} title="Advanced settings" onPress={() => this.toggleSettings()}/>
                    </View>
                    <Collapsible collapsed={!this.state.showSettings}>
                        <View style={{ flexDirection: "row", justifyContent: "flex-start", marginTop: 10 }}>
                            <Toggle checked={true}>
                                Send read markers
                            </Toggle>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "flex-start", marginTop: 10 }}>
                            <Toggle checked={true}>
                                Send chat states
                            </Toggle>
                        </View>
                    </Collapsible>

                    <Text style={[material.body1White, { marginBottom: 10, marginTop: 10 }]}>You can now be contacted by your XMPP address. If you want to set a profile picture, just tap your name.</Text>

                    <Button title="Start chatting" onPress={() => {
                        this.navigation.reset({
                            index: 0,
                            routes: [{ name: Routes.CONVERSATIONLIST }]
                        });
                    }} />
                </View>
            </View>
        );
    }
}