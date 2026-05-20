import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { SplashScreen } from '../src/screens/SplashScreen';
import { HomeScreen } from '../src/screens/HomeScreen';
import { RoutePlannerScreen } from '../src/screens/RoutePlannerScreen';
import { RouteRiskScreen } from '../src/screens/RouteRiskScreen';
import { IncidentFeedScreen } from '../src/screens/IncidentFeedScreen';
import { ReportIncidentScreen } from '../src/screens/ReportIncidentScreen';
import { AgentTraceScreen } from '../src/screens/AgentTraceScreen';
import { OutcomeScreen } from '../src/screens/OutcomeScreen';
import { DemoControlScreen } from '../src/screens/DemoControlScreen';

type Screen = 'Splash' | 'Home' | 'RoutePlanner' | 'RouteRisk' | 'IncidentFeed' | 'ReportIncident' | 'AgentTrace' | 'Outcome' | 'Demo';

export default function Page() {
  const [screen, setScreen] = useState<Screen>('Splash');
  const nav = (s: string) => setScreen(s as Screen);

  const renderScreen = () => {
    switch (screen) {
      case 'Splash': return <SplashScreen onDone={() => setScreen('Home')} />;
      case 'Home': return <HomeScreen onNavigate={nav} />;
      case 'RoutePlanner': return <RoutePlannerScreen onNavigate={nav} />;
      case 'RouteRisk': return <RouteRiskScreen onNavigate={nav} />;
      case 'IncidentFeed': return <IncidentFeedScreen onNavigate={nav} />;
      case 'ReportIncident': return <ReportIncidentScreen onNavigate={nav} />;
      case 'AgentTrace': return <AgentTraceScreen onNavigate={nav} />;
      case 'Outcome': return <OutcomeScreen onNavigate={nav} />;
      case 'Demo': return <DemoControlScreen onNavigate={nav} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.root}>
        {renderScreen()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0A' },
});
