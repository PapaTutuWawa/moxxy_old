import React from 'react';
import { View } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import * as eva from "@eva-design/eva";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import SettingsView from './ui/settings/SettingsView';

import ProfileView from './ui/chat/ProfileView';
import StartView from './ui/start/StartView';
import { ChatViewWrapper } from './ui/chat/ChatView';
import ConversationsListView from './ui/conversationlist/ConversationsListView';
import NewConversationView from './ui/newconversation/NewConversation';
import PreStartView from './ui/prestart/PreStartView';
import LicensesView from './ui/licenses/LicensesView';
import NewContactView from './ui/newcontact/NewContactView';
import SelfProfileView from './ui/selfprofile/SelfProfileView';

import { Routes } from "./ui/constants";

const Stack = createNativeStackNavigator();

// TODO: Set statusbar color depending on the color scheme
// TODO: The self-profile is pretty janky. REWORK!
const App = () => {
  //const isDarkMode = useColorScheme() === "dark";
  const isDarkMode = true;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.darker }}>
      <IconRegistry icons={EvaIconsPack} />
      <SafeAreaProvider>
        <ApplicationProvider {...eva} theme={eva.dark}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={Routes.PRESTART}>
              <Stack.Screen
                name={Routes.CONVERSATIONLIST}
                options={{
                  headerShown: false
                }}
                component={ConversationsListView} />
              <Stack.Screen
                name={Routes.CONVERSATION}
                options={{
                  headerShown: false
                }}
                component={ChatViewWrapper} />
              <Stack.Screen
                name={Routes.PROFILE}
                options={({route}) => ({
                  headerShown: false
                })}
                component={ProfileView} />
              <Stack.Screen
                name={Routes.PRESTART}
                options={{ headerShown: false }}
                component={PreStartView} />
              <Stack.Screen
                name={Routes.START}
                options={{ headerShown: false }}
                component={StartView} />
              <Stack.Screen
                name={Routes.NEWCONVERSATION}
                options={{
                  headerShown: false
                }}
                component={NewConversationView} />
              <Stack.Screen
                name={Routes.NEWCONTACT}
                options={{
                  headerShown: false
                }}
                component={NewContactView} />
              <Stack.Screen
                name={Routes.SETTINGS}
                options={{
                  headerShown: false
                }}
                component={SettingsView} />
              <Stack.Screen
                name={Routes.LICENSES}
                options={{
                  headerShown: false
                }}
                component={LicensesView} />
              <Stack.Screen
                name={Routes.SELFPROFILE}
                options={{
                  headerShown: false
                }}
                component={SelfProfileView} />
            </Stack.Navigator>
          </NavigationContainer>
        </ApplicationProvider>
      </SafeAreaProvider>
    </View>
  );
};

export default App;