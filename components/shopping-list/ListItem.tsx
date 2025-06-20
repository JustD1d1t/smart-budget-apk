import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ShoppingList {
  id: string;
  name: string;
  isOwner: boolean;
}

interface Props {
  list: ShoppingList;
  onRemove?: (id: string) => void;
  onEdit?: (list: ShoppingList) => void;
}

export default function ListItem({ list, onRemove, onEdit }: Props) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{list.name}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.outline]}
          onPress={() => router.push(`/shopping-lists/${list.id}`)}
        >
          <Text style={styles.buttonText}>Otwórz</Text>
        </TouchableOpacity>

        {onEdit && (
          <TouchableOpacity
            style={[styles.button, styles.primary]}
            onPress={() => onEdit(list)}
          >
            <Text style={styles.buttonText}>Edytuj</Text>
          </TouchableOpacity>
        )}

        {onRemove && (
          <TouchableOpacity
            style={[styles.button, styles.danger]}
            onPress={() => onRemove(list.id)}
          >
            <Text style={styles.buttonText}>Usuń</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  outline: {
    backgroundColor: "#6b7280",
  },
  primary: {
    backgroundColor: "#2563eb",
  },
  danger: {
    backgroundColor: "#dc2626",
  },
});
