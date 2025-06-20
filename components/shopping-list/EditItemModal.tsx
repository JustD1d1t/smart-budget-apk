import { Picker } from "@react-native-picker/picker";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Item = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

type Props = {
  item: Item;
  onChange: (item: Item) => void;
  onClose: () => void;
  onSave: () => void;
};

const UNITS = ["szt", "kg", "l", "opak", "g"];

export default function EditItemModal({ item, onChange, onClose, onSave }: Props) {
  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>✏️ Edytuj produkt</Text>

          <TextInput
            placeholder="Nazwa produktu"
            value={item.name}
            onChangeText={(text) => onChange({ ...item, name: text })}
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              placeholder="Ilość"
              keyboardType="numeric"
              value={item.quantity.toString()}
              onChangeText={(text) =>
                onChange({ ...item, quantity: Number(text) || 0 })
              }
              style={[styles.input, styles.flex]}
            />
            <View style={[styles.pickerWrapper, styles.flex]}>
              <Picker
                selectedValue={item.unit}
                onValueChange={(val) => onChange({ ...item, unit: val })}
              >
                {UNITS.map((unit) => (
                  <Picker.Item key={unit} label={unit} value={unit} />
                ))}
              </Picker>
            </View>
          </View>

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
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
    ...Platform.select({ android: { paddingHorizontal: 4 } }),
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
    marginLeft: 8,
  },
  ghost: {
    backgroundColor: "#e5e7eb",
  },
});
