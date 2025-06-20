// components/shopping-list/ProductAutocomplete.tsx
import { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Card from '../ui/Card';
import Input from '../ui/Input';

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
        const safeValue = value || '';

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
            setSuggestions([{ name: safeValue, category: 'inne' }, ...filtered]);
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
            <Input
                placeholder="Wpisz produkt..."
                value={value}
                onChangeText={(text) => {
                    onChange(text);
                    setShowSuggestions(true);
                }}
                error={error}
            />

            {showSuggestions && suggestions.length > 0 && (
                <Card style={styles.dropdown}>
                    <FlatList
                        keyboardShouldPersistTaps="handled"
                        data={suggestions}
                        keyExtractor={(item, index) => item.name + index}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedItem(item)}
                                style={styles.suggestionItem}
                            >
                                <Text style={styles.suggestionText}>
                                    {item.name}{' '}
                                    <Text style={styles.categoryText}>({item.category})</Text>
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </Card>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        zIndex: 10,
    },
    dropdown: {
        marginTop: 4,
        maxHeight: 180,
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
        color: '#6b7280',
    },
});
