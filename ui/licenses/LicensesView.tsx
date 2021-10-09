import { Card } from "@ui-kitten/components";
import React from "react";
import { View, Linking, FlatList, TouchableOpacity } from "react-native";
import { Text } from "react-native-elements";
import { material } from "react-native-typography";
import FlatHeader from "../FlatHeader";
import { backgroundStyle } from "../helpers";

interface Library {
    title: string;
    license: "MIT" | "Apache-2.0" | "Unknown";
    url: string;
};

export default class LicensesView extends React.Component {
    private navigation: any;
    private libraries: Library[] = [
        {
            title: "React",
            license: "MIT",
            url: "https://github.com/facebook/react"
        },
        {
            title: "React Native",
            license: "MIT",
            url: "https://github.com/facebook/react-native"
        },
        {
            title: "react-native-fs",
            license: "MIT",
            url: "https://github.com/itinance/react-native-fs"
        },
        {
            title: "react-native-async-storage",
            license: "MIT",
            url: "https://github.com/react-native-async-storage/async-storage"
        },
        {
            title: "React Navigation",
            license: "MIT",
            url: "https://github.com/react-navigation/react-navigation"
        },
        {
            title: "React Native UI Kitten",
            license: "MIT",
            url: "https://github.com/akveo/react-native-ui-kitten"
        },
        {
            title: "React Native Elements",
            license: "MIT",
            url: "https://github.com/react-native-elements/react-native-elements"
        },
        {
            title: "React Native Vector Icons",
            license: "MIT",
            url: "https://github.com/oblador/react-native-vector-icons"
        },
        {
            title: "React Native Typography",
            license: "MIT",
            url: "https://github.com/hectahertz/react-native-typography"
        },
        {
            title: "react-native-qrcode-svg",
            license: "MIT",
            url: "https://github.com/awesomejerry/react-native-qrcode-svg"
        },
        {
            title: "react-native-image-crop-picker",
            license: "MIT",
            url: "https://github.com/ivpusic/react-native-image-crop-picker"
        },
        {
            title: "events",
            license: "MIT",
            url: "https://github.com/Gozala/events"
        },
        {
            title: "WatermelonDB",
            license: "MIT",
            url: "https://github.com/Nozbe/WatermelonDB"
        },
        {
            title: "stanza",
            license: "MIT",
            url: "https://github.com/legastero/stanza"
        },
        {
            title: "TypeScript",
            license: "Apache-2.0",
            url: "https://github.com/Microsoft/TypeScript"
        },
        {
            title: "XMPP Providers",
            license: "Unknown",
            url: "https://invent.kde.org/melvo/xmpp-providers"
        }
    ];

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;
    }

    renderLibrary({ item }) {
        return (
            <View style={{ width: "100%", paddingBottom: 10 }}>
                <Card onPress={() => Linking.openURL(item.url)}>
                    <Text style={material.headlineWhite}>{item.title}</Text>
                    <Text style={material.subheadingWhite}>Licensed under {item.license}</Text>
                </Card>
            </View>
        );
    }

    render() {
        return (
            <View style={{ height: "100%", ...backgroundStyle(true)}}>
                <FlatHeader navigation={this.navigation} title="Licenses" />
                <View style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}>
                    <FlatList
                        style={{ width: "100%" }}
                        data={this.libraries}
                        showsVerticalScrollIndicator={false}
                        renderItem={this.renderLibrary} />
                </View>
            </View>
        );
    }
};