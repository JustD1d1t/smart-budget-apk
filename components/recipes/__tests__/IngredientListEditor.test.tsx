import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import IngredientListEditor from '../IngredientListEditor';

// Mock IngredientFormRow to isolate IngredientListEditor behavior
jest.mock('../IngredientFormRow', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return ({ index, ingredient, onChange, onRemove, errors }) => (
        <View testID={`row-${index}`}>
            <Text testID={`name-${index}`}>{ingredient.name}</Text>
            {errors?.name && <Text testID={`error-name-${index}`}>{errors.name}</Text>}
            <TouchableOpacity testID={`change-${index}`} onPress={() => onChange(index, ingredient)} />
            <TouchableOpacity testID={`remove-${index}`} onPress={() => onRemove(index)} />
        </View>
    );
});

describe('IngredientListEditor', () => {
    const ingredients = [
        { name: 'Tomato', quantity: 2, unit: 'kg' },
        { name: 'Salt', quantity: 1, unit: 'tsp' },
    ];
    const errors = [
        { name: 'Brak nazwy' },
        {},
    ];
    let onChange: jest.Mock;
    let onRemove: jest.Mock;

    beforeEach(() => {
        onChange = jest.fn();
        onRemove = jest.fn();
    });

    it('renders a row for each ingredient with correct name', () => {
        const { getByTestId } = render(
            <IngredientListEditor
                ingredients={ingredients}
                errors={errors}
                onChange={onChange}
                onRemove={onRemove}
            />
        );
        expect(getByTestId('row-0')).toBeTruthy();
        expect(getByTestId('name-0').props.children).toBe('Tomato');
        expect(getByTestId('row-1')).toBeTruthy();
        expect(getByTestId('name-1').props.children).toBe('Salt');
    });

    it('passes error messages to respective rows', () => {
        const { getByTestId, queryByTestId } = render(
            <IngredientListEditor
                ingredients={ingredients}
                errors={errors}
                onChange={onChange}
                onRemove={onRemove}
            />
        );
        // First row has error
        expect(getByTestId('error-name-0').props.children).toBe('Brak nazwy');
        // Second row has no error
        expect(queryByTestId('error-name-1')).toBeNull();
    });

    it('invokes onChange with correct args when change button pressed', () => {
        const { getByTestId } = render(
            <IngredientListEditor
                ingredients={ingredients}
                errors={errors}
                onChange={onChange}
                onRemove={onRemove}
            />
        );
        fireEvent.press(getByTestId('change-1'));
        expect(onChange).toHaveBeenCalledWith(1, ingredients[1]);
    });

    it('invokes onRemove with correct index when remove button pressed', () => {
        const { getByTestId } = render(
            <IngredientListEditor
                ingredients={ingredients}
                errors={errors}
                onChange={onChange}
                onRemove={onRemove}
            />
        );
        fireEvent.press(getByTestId('remove-0'));
        expect(onRemove).toHaveBeenCalledWith(0);
    });
});
