import React from "react";
import { View, TouchableWithoutFeedback, Linking } from "react-native";
import { Button, Text } from "react-native-elements";
import { Icon, Input } from "@ui-kitten/components";
import { material } from "react-native-typography";
import { backgroundStyle } from "../helpers";

import Providers from "../../data/providers-A.json";
import FlatHeader from "../FlatHeader";

interface RegisterEasyComponentState {
    username: string;
    password: string;
    provider: any;
    waiting: boolean;
    showError: boolean;
    errorMessage: string;
};

export default class RegisterEasyComponent extends React.Component {
    state: RegisterEasyComponentState;

    private isDarkMode: boolean = true;
    private navigation: any;

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;

        const providerIndex = Math.floor(Math.random() * (Providers.length - 1));

        this.state = {
            username: "",
            provider: Providers[providerIndex],
            waiting: false,
            password: "",
            showError: false,
            errorMessage: ""
        };
    }

    onKeyPress(text: string) {
        this.setState({
            username: text,
            showError: false
        });
    }

    generateNewProvider() {
        let providerIndex = Math.floor(Math.random() * Providers.length);
        // Prevent us from landing on the same provider right after requesting a new one
        if (this.state.provider.jid === Providers[providerIndex].jid) {
            providerIndex = providerIndex + 1 % Providers.length - 1;
        }

        this.setState({
            provider: Providers[providerIndex]
        });
    }

    showError = (msg: string) => {
        this.setState({
            showError: true,
            errorMessage: msg,
        });
    }

    resetError = () => {
        if (!this.state.showError) return;

        this.setState({
            showError: false
        });
    }

    createAccount() {
        if (this.state.waiting) return;
        if (this.state.username.length === 0) {
            this.showError("Username cannot be empty");
            return
        }

        // TODO: Once implementing, check for internet
        // TODO: Perform input validation, e.g. do not allow special characters, except ...
        // TODO: Generate password
        // TODO: Make it so that if the user accidentally closes this screen, that the user
        //       can return here

        this.setState({
            waiting: true,
            showError: false
        });

        setTimeout(() => {
            this.navigation.reset({
                index: 0,
                routes: [{ name: "Start/PostRegister", params: {
                    jid: `${this.state.username}@${this.state.provider.jid}`,
                    username: this.state.username
                }}]
            });
        }, 3000);
    }

    renderProviderRegenerate = (props: any) => {
        return (
            <TouchableWithoutFeedback
                disabled={this.state.waiting}
                onPress={() => this.generateNewProvider()}>
                <Icon {...props} name="refresh" />
            </TouchableWithoutFeedback>
        );
    }

    render() {
        const langs = Object.keys(this.state.provider.website);
        const website = "en" in langs ? this.state.provider.website.en : this.state.provider.website[langs[0]];

        return (
            <View style={{
                height: "100%",
                ...backgroundStyle(this.isDarkMode)
            }}>
                <FlatHeader navigation={this.navigation} title="Registration" />
                <View style={{
                    paddingLeft: 50,
                    paddingRight: 50,
                    paddingBottom: 60,
                    paddingTop: 15,
                }}>
                    <Text style={this.isDarkMode ? material.body2White : material.body2}>
                        The easy registration will randomly select a XMPP provider with a good reputation
                        to create your new account. A password will be auto-generated for you.
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                        <Input
                            style={{ borderBottomRightRadius: 0, borderTopRightRadius: 0, flex: 1 }}
                            placeholder="Username"
                            status={this.state.showError ? "danger" : ""}
                            value={this.state.username}
                            onChangeText={text => this.onKeyPress(text)}
                            disabled={this.state.waiting} />
                        <Input
                            style={{ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }}
                            value={"@" + this.state.provider.jid}
                            disabled={true}
                            accessoryRight={this.renderProviderRegenerate} />
                    </View>

                    <Text style={{ color: "blue" }} onPress={() => Linking.openURL(website)}>{this.state.provider.jid}'s website</Text>

                    { this.state.showError && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={[material.body2, { color: "red" }]}>{this.state.errorMessage}</Text>
                        </View>
                    )}

                    <View style={{ marginTop: 15 }}>
                        <Button loading={this.state.waiting} title="Create Account" onPress={() => this.createAccount()} />
                    </View>
                </View>
            </View>
        );
    }
}