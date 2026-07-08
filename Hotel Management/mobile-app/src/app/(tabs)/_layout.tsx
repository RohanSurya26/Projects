import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
              {focused && (
                <View style={{
                  position: 'absolute', top: -6, left: '50%', marginLeft: -2,
                  width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent,
                }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color} />
              {focused && (
                <View style={{
                  position: 'absolute', top: -6, left: '50%', marginLeft: -2,
                  width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent,
                }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Rooms',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name={focused ? 'bed' : 'bed-outline'} size={22} color={color} />
              {focused && (
                <View style={{
                  position: 'absolute', top: -6, left: '50%', marginLeft: -2,
                  width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent,
                }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
              {focused && (
                <View style={{
                  position: 'absolute', top: -6, left: '50%', marginLeft: -2,
                  width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent,
                }} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
