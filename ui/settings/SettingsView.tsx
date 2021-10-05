import React from "react";
import { FlatList, View, Switch, TouchableOpacity } from "react-native";
import { Text } from "react-native-elements";
import { material } from "react-native-typography";
import { Routes } from "../constants";
import { backgroundStyle } from "../helpers";

interface Setting {
    title: string;
    description: string;
    type: "switch" | "dummy";
    defaultValue: any;
    value: any;
    onChange: (value: any) => void;
};

// TODO: Add sections => Use SectionList
export default class SettingsView extends React.Component {
    private navigation: any;
    private settings: Setting[] = [
        {
            title: "Send chat markers",
            description: "When set, tells your correspondant that you have read a message or are currently typing",
            type: "switch",
            defaultValue: true,
            value: true,
            onChange: (value: boolean) => {}
        },
        {
            title: "Typing indicators",
            description: "When set, tells your correspondant that you're typing",
            type: "switch",
            defaultValue: true,
            value: true,
            onChange: (value: boolean) => {}
        },
        {
            title: "Licenses",
            description: "Show licenses of used libraries and projects",
            type: "dummy",
            defaultValue: null,
            value: null,
            onChange: (value: any) => {
                this.navigation.navigate(Routes.LICENSES);
            }
        }
    ];

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;
    }

    renderSettingControl(setting: Setting) {
        switch (setting.type) {
            case "switch":
                return (
                    <Switch value={setting.value} />
                );
            case "dummy":
                return;
        }
    }
    
    renderSetting = ({item}) => {
        return (
            <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10, flexDirection: "row" }}>
                <View style={{ flex: 1 }}>
                    <Text style={material.subheadingWhite}>{item.title}</Text>
                    <Text style={material.body1White}>{item.description}</Text>
                </View>
                <View style={{ justifyContent: "center" }}>
                    {this.renderSettingControl(item)}
                </View>
            </View>
        );
    }

    wrapSetting = ({ item }) => {
        if (item.type === "dummy")
            return (
                <TouchableOpacity style={{ flex: 1 }} onPress={() => item.onChange(null)}>
                    {this.renderSetting({ item })}
                </TouchableOpacity>
            );
        
        return this.renderSetting({ item });
    }

    render() {
        return (
            <View style={{
                height: "100%",
                ...backgroundStyle(true)
            }}>
                <FlatList
                    data={this.settings}
                    renderItem={this.wrapSetting} />
            </View>
        );
    }
};