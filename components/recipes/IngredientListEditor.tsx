import React from 'react';
import { StyleSheet, View } from 'react-native';
import IngredientFormRow, { Ingredient, IngredientError } from './IngredientFormRow';

interface Props {
    ingredients: Ingredient[];
    onChange: (index: number, updated: Ingredient) => void;
    onRemove: (index: number) => void;
    errors?: IngredientError[];
}

export default function IngredientListEditor({ ingredients, onChange, onRemove, errors = [] }: Props) {
    return (
        <View style={styles.container}>
            {ingredients.map((item, index) => (
                <IngredientFormRow
                    key={item.name || index}
                    index={index}
                    ingredient={item}
                    onChange={onChange}
                    onRemove={onRemove}
                    errors={errors[index]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
});
