import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { TouchableOpacity } from 'react-native'; 
import { store, persistor } from './src/store';
import ConnectScreen from './src/screens/ConnectScreen';
import Tab1Screen from './src/screens/Tab1Screen';
import Tab2Screen from './src/screens/Tab2Screen';
import SousTab1Screen from './src/screens/SousTab1Screen';
import SousTab2Screen from './src/screens/SousTab2Screen';
import SousTab3Screen from './src/screens/SousTab3Screen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const TopTab = createMaterialTopTabNavigator();

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: 'white' }, // optionnel, pour styliser le background
      }}
    >
      <Tab.Screen
        name="Enregistrement"
        component={Tab1Screen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mic-outline" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="RAVED"
        component={Tab2Stack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

function Tab2Stack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SousTabs" 
        component={SousTabs} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

function Tab2ScreenWithTopTabs({ navigation }) {
  return (
    <>
      <SousTabs />
      <Tab2Screen navigation={navigation} />
    </>
  );
}

// sous tab visible dans la tab2
function SousTabs() {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: { backgroundColor: 'black' }, // pour la barre sous les onglets
        tabBarStyle: { backgroundColor: 'white' }, // optionnel, pour styliser le background
      }}
    >
      <TopTab.Screen name="Audio entrée ⠀⠀🔈⠀⠀" component={SousTab1Screen} />
      <TopTab.Screen name="Traitement ⠀⠀⚙️⠀⠀" component={SousTab2Screen} />
      <TopTab.Screen name="Audio sortie ⠀⠀💾⠀⠀" component={SousTab3Screen} />
    </TopTab.Navigator>
  );
}

function CustomHeaderLeft({ navigation }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{ marginLeft: 15 }}
    >
      <Ionicons name="close" size={24} color="black" />
    </TouchableOpacity>
  );
}

// header
export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Connect">
            <Stack.Screen name="Connexion" component={ConnectScreen} />
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs} 
              options={({ navigation }) => ({ 
                headerShown: true,
                headerTitle: 'Fermer la connexion',
                headerBackTitle: 'Back',
                headerLeft: () => <CustomHeaderLeft navigation={navigation} />,
              })} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
