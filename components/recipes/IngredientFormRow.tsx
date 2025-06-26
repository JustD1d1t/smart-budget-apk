import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ProductAutocomplete from "../shopping-list/ProductAutocomplete";
import Input from "../ui/Input";
import Select from "../ui/Select";

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
        <View style={styles.outerContainer}>

            <View style={styles.container}>


                <View>

                    <View >
                        <ProductAutocomplete
                            value={ingredient.name}
                            onChange={(val) => handleChange("name", val)}
                            onClick={(val) => handleChange("name", val)}
                            error={errors.name}
                        />
                    </View>
                    <View style={styles.rowBottom}>
                        <View style={styles.quantityWrapper}>
                            <Input
                                value={ingredient.quantity.toString()}
                                onChangeText={(text) => handleChange("quantity", Number(text))}
                                placeholder="Ilość"
                                keyboardType="numeric"
                                error={errors.quantity}
                            />
                        </View>
                        <View style={styles.unitWrapper}>
                            <Select
                                value={ingredient.unit}
                                options={UNITS.map(u => ({label: u, value: u}))}
                                placeholder="Jednostka"
                                onChange={(val) => handleChange("unit", val)}
                                error={errors.unit}
                            />
                        </View>
                    </View>
                </View>
            </View>

            <View>
                <TouchableOpacity onPress={() => onRemove(index)} style={styles.removeButton}>
                    <Text style={styles.removeText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        display: 'flex',
        flexDirection: 'row',
    },
    container: {
        marginBottom: 16,
        display: 'flex',
        flexWrap: 'nowrap',
        flexGrow: 1,
    },
    fullInput: {
        flex: 1,
        marginRight: 12,
        width: '100%',
    },
    removeButton: {
        padding: 8,
    },
    removeText: {
        color: "#ef4444",
        fontSize: 18,
    },
    rowBottom: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    quantityWrapper: {
        flex: 1,
        marginRight: 12,
    },
    unitWrapper: {
        flex: 1,
    },
});
