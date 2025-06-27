import { Picker } from "@react-native-picker/picker";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import type { PantryItem } from "../../stores/pantriesStore";

const CATEGORIES = ["żywność", "chemia", "napoje", "mrożonki", "inne"];
const UNITS = ["szt", "kg"];

type Props = {
    item: PantryItem;
    onChange: (item: PantryItem) => void;
    onSave: () => void;
    onClose: () => void;
};

export default function EditPantryItemModal({
    item,
    onChange,
    onSave,
    onClose,
}: Props) {
    return (
        <Modal transparent animationType="slide" visible={true}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>✏️ Edytuj produkt</Text>

                    <TextInput
                        value={item.name}
                        onChangeText={(text) => onChange({ ...item, name: text })}
                        placeholder="Nazwa produktu"
                        style={styles.input}
                    />

                    <Picker
                        selectedValue={item.category}
                        onValueChange={(value) => onChange({ ...item, category: value })}
                        style={styles.picker}
                    >
                        <Picker.Item label="Wybierz kategorię" value="" />
                        {CATEGORIES.map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} />
                        ))}
                    </Picker>

                    <View style={styles.row}>
                        <TextInput
                            value={item.quantity.toString()}
                            onChangeText={(text) =>
                                onChange({ ...item, quantity: Number(text) || 0 })
                            }
                            placeholder="Ilość"
                            keyboardType="numeric"
                            style={[styles.input, styles.flex]}
                        />
                        <Picker
                            selectedValue={item.unit}
                            onValueChange={(value) => onChange({ ...item, unit: value })}
                            style={[styles.picker, styles.flex]}
                        >
                            <Picker.Item label="Jednostka" value="" />
                            {UNITS.map((unit) => (
                                <Picker.Item key={unit} label={unit} value={unit} />
                            ))}
                        </Picker>
                    </View>

                    <TextInput
                        value={item.expiry_date || ""}
                        onChangeText={(text) => onChange({ ...item, expiry_date: text || null })}
                        placeholder="Data przydatności (YYYY-MM-DD)"
                        style={styles.input}
                    />

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={onClose} style={[styles.button, styles.ghost]}>
                            <Text>Anuluj</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onSave} style={styles.button}>
                            <Text style={{ color: "white" }}>💾 Zapisz</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "90%",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    picker: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
    },
    row: {
        flexDirection: "row",
        gap: 8,
    },
    flex: {
        flex: 1,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
    },
    button: {
        backgroundColor: "#10b981",
        padding: 10,
        borderRadius: 8,
    },
    ghost: {
        backgroundColor: "#e5e7eb",
        marginRight: 8,
    },
});
