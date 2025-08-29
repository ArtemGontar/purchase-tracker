import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppNavigator } from './AppNavigator';
import { AuthScreen } from '../screens/AuthScreen';
import { ReceiptDetailScreen } from '../screens/ReceiptDetailScreen';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Auth"
        screenOptions={{ 
          headerShown: false 
        }}
      >
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
        />
        <Stack.Screen 
          name="MainTabs" 
          component={AppNavigator} 
        />
        <Stack.Screen 
          name="ReceiptDetail" 
          component={ReceiptDetailScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            animationTypeForReplace: 'push',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
