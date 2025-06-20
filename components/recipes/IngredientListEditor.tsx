// components/recipes/IngredientListEditor.tsx
import { StyleSheet, View } from "react-native";
import { productsDb } from "../../data/productsDb";
import { flattenProductsDb } from "../../utils/flattenProductsDb";
import IngredientFormRow, { Ingredient, IngredientError } from "./IngredientFormRow";

interface Props {
    ingredients: Ingredient[];
    setIngredients: (items: Ingredient[]) => void;
    errors?: IngredientError[];
}

export default function IngredientListEditor({
    ingredients,
    setIngredients,
    errors = [],
}: Props) {
    const flattenedProducts = flattenProductsDb(productsDb);

    const handleIngredientChange = (index: number, updated: Ingredient) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index] = updated;
        setIngredients(updatedIngredients);
    };

    const handleIngredientRemove = (index: number) => {
        const filtered = ingredients.filter((_, i) => i !== index);
        setIngredients(filtered);
    };

    return (
        <View style={styles.container}>
            {ingredients.map((ingredient, index) => (
                <IngredientFormRow
                    key={index}
                    index={index}
                    ingredient={ingredient}
                    onChange={handleIngredientChange}
                    onRemove={handleIngredientRemove}
                    errors={errors?.[index] ?? {}}
                    productsDb={flattenedProducts}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
        paddingVertical: 8,
    },
});
