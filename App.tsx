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
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';

import ProfileView from './ui/chat/ProfileView';
import StartView from './ui/start/StartView';
import { ChatViewWrapper } from './ui/chat/ChatView';
import ConversationsListView from './ui/conversationlist/ConversationsListView';
import NewConversationView from './ui/newconversation/NewConversation';
import PreStartView from './ui/prestart/PreStartView';
import LicensesView from './ui/licenses/LicensesView';

import { Routes } from "./ui/constants";

const Stack = createNativeStackNavigator();

// TODO: ConversationList does not update when we have updated the lastMessageText
// TODO: Set statusbar color depending on the color scheme
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
                name={Routes.SETTINGS}
                options={{
                  headerStyle: {
                    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
                  },
                  headerTitleStyle: {
                    color: isDarkMode ? Colors.lighter : Colors.darker
                  },
                  headerTintColor: isDarkMode ? Colors.lighter : Colors.darker
                }}
                component={SettingsView} />
              <Stack.Screen
                name={Routes.LICENSES}
                options={{
                  title: "Licenses",
                  headerStyle: {
                    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
                  },
                  headerTitleStyle: {
                    color: isDarkMode ? Colors.lighter : Colors.darker
                  },
                  headerTintColor: isDarkMode ? Colors.lighter : Colors.darker
                }}
                component={LicensesView} />
            </Stack.Navigator>
          </NavigationContainer>
        </ApplicationProvider>
      </SafeAreaProvider>
    </View>
  );
};

export default App;