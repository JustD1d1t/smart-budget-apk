// components/expenses/ExpenseFilters.tsx
import { productsDb } from '../../data/productsDb';

import { StyleSheet, View } from "react-native";
import Input from "../ui/Input";
import Select from "../ui/Select";

const CATEGORY_OPTIONS = Object.keys(productsDb).map(obj => ({ label: obj, value: obj }));

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
            <Select
                label="Kategoria"
                value={filterCategory}
                options={CATEGORY_OPTIONS}
                onChange={onFilterCategoryChange}
                placeholder="-- wszystkie --"
            />

            <Select
                label="Sortowanie"
                value={sortOption}
                options={SORT_OPTIONS}
                onChange={onSortOptionChange}
                placeholder="Wybierz..."
            />

            <Input
                label="Data od"
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={onStartDateChange}
            />

            <Input
                label="Data do"
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={onEndDateChange}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
});
