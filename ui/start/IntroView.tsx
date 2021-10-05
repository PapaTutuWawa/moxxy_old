import React from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-elements";
import { Modal, Card } from "@ui-kitten/components";
import { material } from "react-native-typography";
import { backgroundStyle } from "../helpers";

interface IntroComponentState {
    registerModalOpen: boolean;
}

export default class IntroComponent extends React.Component {
    state: IntroComponentState;
    private navigation: any;

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;

        this.state = {
            registerModalOpen: false
        };
    }

    navigate = (easy: boolean) => {
        const route = easy ? "Start/Register/Easy" : "Start/Register";
        this.setState({ registerModalOpen: false });
        this.navigation.navigate(route);
    }

    render() {
        return (
            <View style={{
                padding: 60,
                height: "100%",
                ...backgroundStyle(true)
            }}>
                <Modal
                    visible={this.state.registerModalOpen}
                    onBackdropPress={() => this.setState({ registerModalOpen: false })}
                    backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)"}}>
                    <Card disabled={true}>
                        <Text style={material.body2White}>Choose a username and we will do the rest!</Text>
                        <Button title="Easy Registration" onPress={() => this.navigate(true)}/>
                        <View style={{ marginTop: 10 }}>
                            <Text style={material.body2White}>Choose everything yourself.</Text>
                            <Button title="Advanced Registration" />
                        </View>
                    </Card>
                </Modal>
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
                        <Button type="clear" title="Sign up" onPress={() => this.setState({ registerModalOpen: true })} />
                    </View>
                </View>
            </View>
        );
    }
}