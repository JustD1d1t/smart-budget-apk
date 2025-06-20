import { Picker } from "@react-native-picker/picker";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ProductAutocomplete from "../shopping-list/ProductAutocomplete";

export type Ingredient = {
    name: string;
    quantity: number;
    unit: string;
};

export type IngredientError = {
    name?: string;
    quantity?: string;
    unit?: string;
};

const UNITS = ["g", "kg", "ml", "l", "szt.", "łyżka", "łyżeczka", "szklanka"];

type Props = {
    index: number;
    ingredient: Ingredient;
    onChange: (index: number, updated: Ingredient) => void;
    onRemove: (index: number) => void;
    errors?: IngredientError;
    productsDb: { name: string; category: string }[];
};

export default function IngredientFormRow({
    index,
    ingredient,
    onChange,
    onRemove,
    errors = {},
    productsDb,
}: Props) {
    const handleChange = (field: keyof Ingredient, value: string | number) => {
        onChange(index, { ...ingredient, [field]: value });
    };

    return (
        <View style={styles.row}>
            <View style={styles.flexItem}>
                <ProductAutocomplete
                    productsDb={productsDb}
                    value={ingredient.name}
                    onChange={(val) => handleChange("name", val)}
                    onClick={(val) => handleChange("name", val)}
                    error={errors.name}
                />
            </View>

            <View style={styles.smallInput}>
                <TextInput
                    value={ingredient.quantity.toString()}
                    onChangeText={(text) => handleChange("quantity", Number(text))}
                    keyboardType="numeric"
                    placeholder="Ilość"
                    style={[styles.input, errors.quantity && styles.inputError]}
                />
                {errors.quantity && <Text style={styles.error}>{errors.quantity}</Text>}
            </View>

            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={ingredient.unit}
                    onValueChange={(val) => handleChange("unit", val)}
                >
                    <Picker.Item label="-- wybierz --" value="" />
                    {UNITS.map((unit) => (
                        <Picker.Item key={unit} label={unit} value={unit} />
                    ))}
                </Picker>
                {errors.unit && <Text style={styles.error}>{errors.unit}</Text>}
            </View>

            <TouchableOpacity onPress={() => onRemove(index)} style={styles.removeButton}>
                <Text style={styles.removeText}>🗑 Usuń</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 16,
        alignItems: "flex-start",
    },
    flexItem: {
        flex: 1,
        minWidth: 120,
    },
    smallInput: {
        width: 80,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
    },
    inputError: {
        borderColor: "#dc2626",
    },
    pickerWrapper: {
        width: 140,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#f9f9f9",
        paddingHorizontal: Platform.OS === "android" ? 4 : 0,
    },
    error: {
        color: "#dc2626",
        fontSize: 12,
        marginTop: 4,
    },
    removeButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    removeText: {
        color: "#ef4444",
        fontWeight: "500",
    },
});
