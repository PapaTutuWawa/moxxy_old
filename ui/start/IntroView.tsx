import React from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-elements";
import { Modal, Card } from "@ui-kitten/components";
import { material } from "react-native-typography";
import { backgroundStyle } from "../helpers";

export default class IntroComponent extends React.Component {
    private navigation: any;

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;
    }

    render() {
        return (
            <View style={{
                padding: 60,
                height: "100%",
                ...backgroundStyle(true)
            }}>
                <View style={{ alignItems: "flex-start" }}>
                    <Text style={material.display3White}>Moxxy</Text>
                    <Text style={material.subheadingWhite}>An experiment in building a modern XMPP client</Text>
                </View>

                <View style={{ flex: 1 }} />
                <View>
                    <View style={{ marginTop: 15 }}>
                        <Button title="Login" onPress={() => this.navigation.navigate("Start/Login")} />
                    </View>
                    <View style={{ marginTop: 15, marginBottom: 5 }}>
                        <Button type="clear" title="Sign up" onPress={() => this.navigation.navigate("Start/Register/Easy")} />
                    </View>
                </View>
            </View>
        );
    }
}