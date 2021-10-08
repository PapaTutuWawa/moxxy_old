import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Colors } from 'react-native/Libraries/NewAppScreen';

import IntroComponent from "../start/IntroView";
import RegisterEasyComponent from "../registration/RegisterEasy";
import PostRegisterComponent from "../registration/PostRegister";
import LoginComponent from "../login/Login";

const Stack = createNativeStackNavigator();

export default class StartView extends React.Component {
    render() {
        const isDarkMode = true;

        return (
            <Stack.Navigator initialRouteName="Start/Intro">
                <Stack.Screen
                    options={{ headerShown: false }}
                    name="Start/Intro"
                    component={IntroComponent} />
                <Stack.Screen
                    name="Start/Register/Easy"
                    options={{
                        headerShown: false
                    }}
                    component={RegisterEasyComponent} />
                <Stack.Screen
                    name="Start/Login"
                    options={{
                        headerShown: false
                    }}
                    component={LoginComponent} />
                <Stack.Screen options={{ headerShown: false }} name="Start/PostRegister" component={PostRegisterComponent} />
            </Stack.Navigator>
        );
    }
}