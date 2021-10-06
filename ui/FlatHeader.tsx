import { Icon } from "@ui-kitten/components";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { backgroundStyle } from "./helpers";

interface FlatHeaderProps {
    navigation: any;
    showBackButton?: boolean;
}

export default class FlatHeader extends React.Component {
    private navigation: any;
    private showBackButton: boolean;

    constructor(props: FlatHeaderProps) {
        super(props);

        this.navigation = props.navigation;
        this.showBackButton = "showBackButton" in props ? props.showBackButton : true;
    }

    render() {
        return (
            <View style={{
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
                    
                {this.props.children}
            </View>
        );
    }
};