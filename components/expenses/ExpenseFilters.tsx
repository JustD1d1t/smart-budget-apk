import { Picker } from "@react-native-picker/picker";
import { StyleSheet, Text, TextInput, View } from "react-native";

const CATEGORIES = ["", "żywność", "samochód", "rozrywka", "chemia", "inne"];
const SORT_OPTIONS = [
    { label: "Kategoria (A-Z)", value: "category_asc" },
    { label: "Kategoria (Z-A)", value: "category_desc" },
    { label: "Data (najnowsze)", value: "date_desc" },
    { label: "Data (najstarsze)", value: "date_asc" },
    { label: "Kwota (rosnąco)", value: "amount_asc" },
    { label: "Kwota (malejąco)", value: "amount_desc" },
];

type Props = {
    filterCategory: string;
    onFilterCategoryChange: (val: string) => void;
    sortOption: string;
    onSortOptionChange: (val: string) => void;
    startDate: string;
    endDate: string;
    onStartDateChange: (val: string) => void;
    onEndDateChange: (val: string) => void;
};

export default function ExpenseFilters({
    filterCategory,
    onFilterCategoryChange,
    sortOption,
    onSortOptionChange,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
}: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.field}>
                <Text>Kategoria</Text>
                <Picker
                    selectedValue={filterCategory}
                    onValueChange={onFilterCategoryChange}
                >
                    {CATEGORIES.map((cat) => (
                        <Picker.Item key={cat} label={cat || "-- wszystkie --"} value={cat} />
                    ))}
                </Picker>
            </View>

            <View style={styles.field}>
                <Text>Sortowanie</Text>
                <Picker
                    selectedValue={sortOption}
                    onValueChange={onSortOptionChange}
                >
                    {SORT_OPTIONS.map((opt) => (
                        <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                    ))}
                </Picker>
            </View>

            <View style={styles.field}>
                <Text>Data od</Text>
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={startDate}
                    onChangeText={onStartDateChange}
                />
            </View>

            <View style={styles.field}>
                <Text>Data do</Text>
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={endDate}
                    onChangeText={onEndDateChange}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        marginBottom: 16,
    },
    field: {
        gap: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 6,
    },
});
