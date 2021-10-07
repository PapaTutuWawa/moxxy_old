import { Icon } from "@ui-kitten/components";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native-elements";
import { material } from "react-native-typography";
import { backgroundStyle } from "./helpers";

interface FlatHeaderProps {
    navigation: any;
    showBackButton?: boolean;
    fullWidth?: boolean;
    title?: string;
}

export default class FlatHeader extends React.Component {
    private navigation: any;
    private showBackButton: boolean;
    private fullWidth: boolean;
    private title: string;

    constructor(props: FlatHeaderProps) {
        super(props);

        this.navigation = props.navigation;
        this.showBackButton = "showBackButton" in props ? props.showBackButton : true;
        this.fullWidth = "fullWidth" in props ? props.fullWidth : true;
        this.title = props.title || null;
    }

    render() {
        return (
            <View style={{
                ...(!this.fullWidth ? { position: "absolute", top: 0, left: 0 }: {}),
                width: "100%",
                height: 55,
                flexDirection: "row",
                padding: 5,
                ...backgroundStyle(true)
            }}>
                {
                    this.showBackButton && (
                        <View style={{ justifyContent: "center" }}>
                            <TouchableOpacity
                                style={{
                                    marginRight: 10,
                                    marginLeft: 10
                                }}
                                onPress={() => this.navigation.goBack()}>
                                <Icon style={{ width: 28, height: 28}} fill='#ffffff' name='arrow-back' />
                            </TouchableOpacity>
                        </View>
                    )
                }
                
                {
                    this.title && (
                        <View style={{ justifyContent: "center", marginLeft: 10 }}>
                            <Text style={[material.headlineWhite]}>{this.title}</Text>
                        </View>
                    )
                }

                {this.props.children}
            </View>
        );
    }
};