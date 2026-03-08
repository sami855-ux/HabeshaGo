import { useThemeContext } from "@/context/ThemeContext";
import { useState } from "react";
import {
  TextInput,
  View,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";

interface Driver {
  id: string;
  name: string;
  busNumber?: string;
}

export default function DriverSearch() {
  const { colors } = useThemeContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Driver[]>([]);

  const searchDrivers = (text: string) => {
    setQuery(text);

    const mockData: Driver[] = [
      { id: "1", name: "Alex K.", busNumber: "ETH-1223" },
      { id: "2", name: "Mikael T.", busNumber: "ETH-2245" },
    ];

    setResults(
      mockData.filter((d) => d.name.toLowerCase().includes(text.toLowerCase()))
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 12,
      }}
    >
      {/* Search Input */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <TextInput
          placeholder="Search driver name"
          placeholderTextColor={colors.mutedText}
          value={query}
          onChangeText={searchDrivers}
          style={{
            color: colors.text,
            fontSize: 16,
            paddingTop: 34
          }}
        />
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 14,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Left: Driver Info */}
            <View>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {item.name}
              </Text>

              <Text
                style={{
                  color: colors.mutedText,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Driver
              </Text>
            </View>

            {/* Right: Bus Badge */}
            {item.busNumber && (
              <View
                style={{
                  backgroundColor: colors.background,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  {item.busNumber}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
