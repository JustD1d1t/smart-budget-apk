import { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Product = {
    name: string;
    category: string;
};

type Props = {
    productsDb: Product[];
    value: string;
    onChange: (val: string) => void;
    onClick: (name: string) => void;
    error?: string;
};

export default function ProductAutocomplete({
    productsDb,
    value,
    onChange,
    onClick,
    error,
}: Props) {
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const safeValue = value || "";

        if (safeValue.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = productsDb
            .filter((product) =>
                product.name.toLowerCase().includes(safeValue.toLowerCase())
            )
            .slice(0, 5);

        const hasExactMatch = filtered.some(
            (p) => p.name.toLowerCase() === safeValue.toLowerCase()
        );

        if (filtered.length < 5 && !hasExactMatch) {
            setSuggestions([{ name: safeValue, category: "inne" }, ...filtered]);
        } else {
            setSuggestions(filtered);
        }

        setShowSuggestions(!hasExactMatch);
    }, [value, productsDb]);

    const setSelectedItem = (item: Product) => {
        onChange(item.name);
        onClick(item.name);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <View style={styles.wrapper}>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Wpisz produkt..."
                value={value}
                onChangeText={(text) => {
                    onChange(text);
                    setShowSuggestions(true);
                }}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}

            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.dropdown}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item, index) => item.name + index}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedItem(item)}
                                style={styles.suggestionItem}
                            >
                                <Text style={styles.suggestionText}>
                                    {item.name}{" "}
                                    <Text style={styles.categoryText}>({item.category})</Text>
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        position: "relative",
        zIndex: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        backgroundColor: "#fff",
    },
    inputError: {
        borderColor: "#dc2626",
    },
    errorText: {
        color: "#dc2626",
        fontSize: 12,
        marginTop: 4,
    },
    dropdown: {
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        maxHeight: 180,
        marginTop: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    suggestionItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    suggestionText: {
        fontSize: 14,
    },
    categoryText: {
        fontSize: 12,
        color: "#6b7280",
    },
});
