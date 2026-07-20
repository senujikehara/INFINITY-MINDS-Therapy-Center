import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Simulated Screens
import LoginScreen from './screens/LoginScreen';
import TrainerDashboard from './screens/TrainerDashboard';
import ParentDashboard from './screens/ParentDashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setUserRole(role);
    if (role === 'trainer') {
      setCurrentScreen('TrainerDashboard');
    } else {
      setCurrentScreen('ParentDashboard');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentScreen('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {currentScreen === 'Login' && <LoginScreen onLogin={handleLogin} />}
      {currentScreen === 'TrainerDashboard' && <TrainerDashboard onLogout={handleLogout} />}
      {currentScreen === 'ParentDashboard' && <ParentDashboard onLogout={handleLogout} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0716',
  },
});
