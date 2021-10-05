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
import { ChatViewWrapper, ChatViewHeaderComponentWrapper } from './ui/chat/ChatView';
import ConversationsListView from './ui/conversationlist/ConversationsListView';
import NewConversationView from './ui/newconversation/NewConversation';

import { Routes } from "./ui/constants";
import PreStartView from './ui/prestart/PreStartView';

const Stack = createNativeStackNavigator();

// TODO: Move the names of the routes into constants in a different file
// TODO: ConversationList does not update when we have updated the lastMessageText
// TODO: Set statusbar color depending on the color scheme
const App = () => {
  //const isDarkMode = useColorScheme() === "dark";
  const isDarkMode = true;

  // TODO: Manage this somehow
  /*EncryptedStorage.getItem("account_data")
    .then(data => {
      if (!data)
        return;

      console.log("Got account data: " + data);
      data = JSON.parse(data);
      AppRepository.getInstance().connectXMPP({
        jid: data.jid,
        password: data.password
      }, () => {
        console.log("OK");
        useNavigation().navigate("Roster");
      });
    }).catch(err => {
      console.log(JSON.stringify(err));
    });*/

  return (
    <View style={{ flex: 1, backgroundColor: Colors.darker }}>
      <IconRegistry icons={EvaIconsPack} />
      <SafeAreaProvider>
        <ApplicationProvider {...eva} theme={eva.dark}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={Routes.PRESTART}>
              <Stack.Screen
                // TODO: Rename from "Roster" to "ConversationsList"
                name={Routes.CONVERSATIONLIST}
                options={{
                    title: "Moxxy",
                    headerStyle: {
                      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
                    },
                    headerTitleStyle: {
                      color: isDarkMode ? Colors.lighter : Colors.darker
                    },
                    headerTintColor: isDarkMode ? Colors.lighter : Colors.darker,
                    headerRight: () => {
                      const navigation = useNavigation();
                      return (
                        <TouchableOpacity
                          onPress={() => navigation.navigate(Routes.SETTINGS)}>
                            <Icon name="settings" color="#fff" />
                        </TouchableOpacity>
                      );
                    }
                }}
                component={ConversationsListView} />
              <Stack.Screen
                name={Routes.CONVERSATION}
                options={({route}) => ({
                  headerTitle: (props) => {
                    const navigation = useNavigation();
                    return <ChatViewHeaderComponentWrapper navigation={navigation} conversationJid={route.params.conversationJid} />;
                  },
                  headerStyle: {
                    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
                  },
                  headerTitleStyle: {
                    color: isDarkMode ? Colors.lighter : Colors.darker
                  },
                  headerTintColor: isDarkMode ? Colors.lighter : Colors.darker
                })}
                component={ChatViewWrapper} />
              <Stack.Screen
                name={Routes.PROFILE}
                options={({route}) => ({
                  // TODO
                  title: route.params.title,
                  headerStyle: {
                    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
                  },
                  headerTitleStyle: {
                    color: isDarkMode ? Colors.lighter : Colors.darker
                  },
                  headerTintColor: isDarkMode ? Colors.lighter : Colors.darker
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
                  title: "Start new chat",
                  headerStyle: {
                    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
                  },
                  headerTitleStyle: {
                    color: isDarkMode ? Colors.lighter : Colors.darker
                  },
                  headerTintColor: isDarkMode ? Colors.lighter : Colors.darker
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
            </Stack.Navigator>
          </NavigationContainer>
        </ApplicationProvider>
      </SafeAreaProvider>
    </View>
  );
};

export default App;