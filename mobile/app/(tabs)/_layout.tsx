import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#1e293b", borderTopColor: "#334155" },
        tabBarActiveTintColor: "#ef4444",
        tabBarInactiveTintColor: "#64748b",
        headerStyle: { backgroundColor: "#1e293b" },
        headerTintColor: "#f1f5f9",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Live Feed", tabBarLabel: "Feed" }} />
      <Tabs.Screen name="simulate" options={{ title: "Simulate", tabBarLabel: "Simulate" }} />
      <Tabs.Screen name="logs" options={{ title: "Alert Logs", tabBarLabel: "Logs" }} />
    </Tabs>
  );
}
