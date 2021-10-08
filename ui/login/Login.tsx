import React from "react";
import { View, TouchableWithoutFeedback, useWindowDimensions } from "react-native";
import { Icon, Input } from "@ui-kitten/components";
import { material } from "react-native-typography";
import { Button, Text } from "react-native-elements";
import Collapsible from "react-native-collapsible";
import { backgroundStyle } from "../helpers";

import EncryptedStorage from 'react-native-encrypted-storage';

import AppRepository from "../../app/Repository";
import { Routes } from "../constants";
import FlatHeader from "../FlatHeader";

interface LoginComponentState {
    collapsed: boolean;
    waiting: boolean;
    hidePassword: boolean;
    username: string;
    password: string;
    errorType: LoginComponentError | undefined;
    errorString: string
}

enum LoginComponentError {
    JID,        // Something concerning the JID
    PASSWORD,   // Something concerning the password
    BOTH        // When either may be concerned
}

export default class LoginComponent extends React.Component {
    state: LoginComponentState;
    private navigation: any;
    private smState: string = "";

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;

        this.state = {
            collapsed: true,
            waiting: false,
            hidePassword: true,
            username: "",
            password: "",
            errorType: undefined,
            errorString: ""
        };
    }

    toggleAdvanced() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    setUsername = (username: string) => {
        this.setState({
            username: username,
            errorType: undefined
        })
    }

    setPassword = (password: string) => {
        this.setState({
            password: password,
            errorType: undefined
        })
    }

    showError = (type: LoginComponentError, message: string) => {
        this.setState({
            waiting: false,
            errorType: type,
            errorString: message
        });
    }

    login() {
        if (this.state.waiting) return;

        const { username, password } = this.state;
        const jidParts = username.split("@");

        // TODO: Input validation
        if (username.length === 0) {
            this.showError(LoginComponentError.JID, "XMPP address cannot be empty");
            return;
        } else if (jidParts.length !== 2 || jidParts[1].indexOf(".") === -1) {
            // TODO: Not necessarilly
            this.showError(LoginComponentError.JID, "XMPP address is of form \"username@server.example\"");
            return;
        } else if (password.length === 0) {
            this.showError(LoginComponentError.PASSWORD, "Password cannot be empty");
            return;
        }

        this.setState({
            waiting: true,
            showError: false
        });

        AppRepository.getInstance().connectXMPP({
            jid: username,
            password: password,
            smState: this.smState
        }, () => {
            AppRepository.getInstance().getXMPPClient().sm.cache(async state => {
                await EncryptedStorage.setItem("account_data", JSON.stringify({
                    jid: username,
                    password: password,
                    smState: JSON.stringify(state),
                }));
            });

            this.setState({
                waiting: false,
            });
            this.navigation.reset({
                index: 0,
                routes: [
                    { name: Routes.CONVERSATIONLIST }
                ]
            });
        });
    }

    renderPasswordIcon = (props: any) => {
        return (
            <TouchableWithoutFeedback onPress={() => this.setState({ hidePassword: !this.state.hidePassword })}>
                <Icon {...props} name={this.state.hidePassword ? "eye-off" : "eye" } />
            </TouchableWithoutFeedback>
        );
    }

    render() {
        return (
            <View style={{
                height: "100%",
                ...backgroundStyle(true)
            }}>
                <FlatHeader navigation={this.navigation} title="Login" />
                <View style={{
                    paddingTop: 20,
                    paddingBottom: 60,
                    paddingLeft: 60,
                    paddingRight: 60
                }}>
                    <View style={{ marginTop: 10 }}>
                        <Input
                            placeholder="XMPP Address"
                            value={this.state.username}
                            disabled={this.state.waiting}
                            status={this.state.errorType === LoginComponentError.JID ? "danger" : ""}
                            onChangeText={text => this.setUsername(text)} />
                    </View>
                    <View style={{ marginTop: 10, marginBottom: 10 }}>
                        <Input
                            placeholder="Password"
                            value={this.state.password}
                            onChangeText={text => this.setPassword(text)}
                            secureTextEntry={this.state.hidePassword}
                            disabled={this.state.waiting}
                            status={this.state.errorType === LoginComponentError.PASSWORD ? "danger" : ""}
                            accessoryRight={this.renderPasswordIcon} />
                    </View>

                    {
                        this.state.errorType !== undefined && (
                            <Text style={[material.body2White, { color: "red" }]}>
                                {this.state.errorString}
                            </Text>
                        )
                    }

                    <Button
                        type="clear"
                        title="Advanced options"
                        disabled={this.state.waiting}
                        onPress={() => this.toggleAdvanced()}/>
                    
                    <Collapsible style={{ paddingTop: 10 }} collapsed={this.state.collapsed}>
                        <Input disabled={this.state.waiting} placeholder="Server Address" />
                        <Input disabled={this.state.waiting} style={{ marginTop: 10 }} placeholder="Server Port" />
                    </Collapsible>

                    <View style={{ marginTop: 15 }}>
                        <Button
                            loading={this.state.waiting}
                            onPress={() => this.login()}
                            disabled={this.state.username.length === 0 || this.state.password.length === 0}
                            title="Login"/>
                    </View>
                </View>
            </View>
        );
    }
}