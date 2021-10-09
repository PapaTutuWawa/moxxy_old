import React from "react";
import { ActivityIndicator, View } from "react-native";
import EncryptedStorage from "react-native-encrypted-storage";
import AppRepository from "../../app/Repository";
import { Routes } from "../constants";
import { backgroundStyle } from "../helpers";

export default class PreStartView extends React.Component {
    private navigation: any;

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;

        // TODO: Don't block but instead redirect immediately and queue up messages to until we're connected
        EncryptedStorage.getItem("account_data")
            .then(data => {
                if (!data) {
                    this.navigation.reset({
                        index: 0,
                        routes: [
                            { name: Routes.START }
                        ]
                    });

                    return;
                } 

                data = JSON.parse(data);
                const { jid, password } = data;
                const smState = data.smState || ""; // TODO

                AppRepository.getInstance().connectXMPP({
                    jid,
                    password,
                    smState
                }, () => {
                    AppRepository.getInstance().getXMPPClient().sm.cache(async state => {
                        await EncryptedStorage.setItem("account_data", JSON.stringify({
                            jid,
                            password,
                            smState: JSON.stringify(state),
                        }));
                    });

                    this.navigation.reset({
                        index: 0,
                        routes: [
                            { name: Routes.CONVERSATIONLIST }
                        ]
                    });
                });
            });
    }

    render() {
        return (
            <View style={{ flexDirection: "row", flex:1, justifyContent: "center", ...backgroundStyle(true) }}>
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator size="large" />
                </View>
            </View>
        );
    }
}