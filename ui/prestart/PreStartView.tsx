import React from "react";
import { ActivityIndicator, View } from "react-native";
import EncryptedStorage from "react-native-encrypted-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

                    // TODO: Do more checks here because I got a wrong JID
                    AsyncStorage.getItem("@account_metadata")
                        .then(async data => {
                            if (data !== null) {
                                const obj = JSON.parse(data);
                                AppRepository.getInstance().setUserData({
                                    jid,
                                    avatarUrl: obj.avatarUrl,
                                    hasAvatar: obj.hasAvatar
                                });
                            } else {
                                await AsyncStorage.setItem("@account_metadata", JSON.stringify({
                                    jid,
                                    avatarUrl: "",
                                    hasAvatar: true
                                }));
                                AppRepository.getInstance().setUserData({
                                    jid,
                                    avatarUrl: "",
                                    hasAvatar: true
                                });
                            }
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