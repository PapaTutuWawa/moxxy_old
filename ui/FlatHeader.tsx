import { Icon } from "@ui-kitten/components";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { backgroundStyle } from "./helpers";

export default class FlatHeader extends React.Component {
    private navigation: any;

    constructor(props: any) {
        super(props);

        this.navigation = props.navigation;
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
                    
                {this.props.children}
            </View>
        );
    }
};