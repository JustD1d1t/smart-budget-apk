// components/pantries/AddPantryItemForm.tsx

import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { supabase } from "../../lib/supabaseClient";

const CATEGORIES = ["\u017cywno\u015b\u0107", "chemia", "napoje", "mro\u017conki", "inne"];
const UNITS = ["szt", "kg"];

interface Props {
    pantryId: string;
    onItemAdded: (item: {
        id: string;
        name: string;
        category: string;
        quantity: number;
        unit: string;
        expiry_date?: string | null;
    }) => void;
}

export default function AddPantryItemForm({ pantryId, onItemAdded }: Props) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("");
    const [expiryDate, setExpiryDate] = useState("");

    const handleSubmit = async () => {
        if (!name.trim() || !category || !quantity || !unit) {
            showMessage({ message: "Wszystkie pola (oprócz daty) są wymagane", type: "danger" });
            return;
        }

        const { data, error } = await supabase
            .from("pantry_items")
            .insert({
                pantry_id: pantryId,
                name: name.trim(),
                category,
                quantity: Number(quantity),
                unit,
                expiry_date: expiryDate || null,
            })
            .select()
            .single();

        if (error) {
            console.error("B\u0142\u0105d dodawania produktu:", error.message);
            showMessage({ message: error.message, type: "danger" });
        } else {
            onItemAdded(data);
            setName("");
            setCategory("");
            setQuantity("");
            setUnit("");
            setExpiryDate("");
            showMessage({ message: "Produkt dodany!", type: "success" });
        }
    };

    return (
        <View style={{ gap: 10 }}>
            <TextInput
                style={styles.input}
                placeholder="Nazwa produktu"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Kategoria (np. \u017cywno\u015b\u0107)"
                value={category}
                onChangeText={setCategory}
            />
            <TextInput
                style={styles.input}
                placeholder="Ilo\u015b\u0107"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Jednostka (np. szt, kg)"
                value={unit}
                onChangeText={setUnit}
            />
            <TextInput
                style={styles.input}
                placeholder="Data przydatno\u015bci (opcjonalna)"
                value={expiryDate}
                onChangeText={setExpiryDate}
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>➕ Dodaj produkt</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
    },
    button: {
        backgroundColor: "#10b981",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});
