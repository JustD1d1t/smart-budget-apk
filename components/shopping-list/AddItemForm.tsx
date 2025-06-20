import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { productsDb } from "../../data/productsDb";
import { supabase } from "../../lib/supabaseClient";
import { flattenProductsDb } from "../../utils/flattenProductsDb";
import ProductAutocomplete from "./ProductAutocomplete";

interface Props {
    listId: string;
    onItemAdded?: (item: any) => void;
}

const AddItemForm = ({ listId, onItemAdded }: Props) => {
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("szt");
    const [errors, setErrors] = useState<{ name?: string; quantity?: string }>({});

    const flatProducts = flattenProductsDb(productsDb);

    const handleSubmit = async () => {
        const newErrors: typeof errors = {};

        if (!name.trim()) newErrors.name = "Podaj nazwę produktu.";
        if (!quantity.trim()) newErrors.quantity = "Podaj ilość.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const matchedProduct = flatProducts.find(
            (product) => product.name.toLowerCase() === name.toLowerCase()
        );
        const category = matchedProduct?.category ?? "inne";

        try {
            const { data, error } = await supabase
                .from("shopping_items")
                .insert({
                    list_id: listId,
                    name,
                    category,
                    quantity: Number(quantity),
                    unit,
                    bought: false,
                })
                .select()
                .single();

            if (error) throw error;

            setName("");
            setQuantity("");
            setUnit("szt");
            onItemAdded?.(data);
        } catch (err) {
            console.error("Błąd przy dodawaniu produktu:", err);
            Alert.alert("Błąd", "Nie udało się dodać produktu.");
        }
    };

    return (
        <View style={styles.container}>
            <ProductAutocomplete
                productsDb={flatProducts}
                value={name}
                onChange={setName}
                onClick={setName}
                error={errors.name}
            />

            <TextInput
                placeholder="Ilość"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                style={[styles.input, errors.quantity && styles.inputError]}
            />
            {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}

            <View style={styles.pickerWrapper}>
                <Picker selectedValue={unit} onValueChange={(val) => setUnit(val)}>
                    <Picker.Item label="szt" value="szt" />
                    <Picker.Item label="kg" value="kg" />
                    <Picker.Item label="g" value="g" />
                    <Picker.Item label="l" value="l" />
                    <Picker.Item label="ml" value="ml" />
                </Picker>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Dodaj produkt</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddItemForm;

const styles = StyleSheet.create({
    container: {
        gap: 12,
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
    errorText: {
        color: "#dc2626",
        fontSize: 12,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#f9f9f9",
    },
    button: {
        backgroundColor: "#10b981",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});
