import { fireEvent, render, screen } from '@testing-library/react-native';
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
        render(
            <IngredientListEditor
                ingredients={ingredients}
                errors={errors}
                onChange={onChange}
                onRemove={onRemove}
            />
        );
        expect(screen.getByTestId('row-0')).toBeTruthy();
        expect(screen.getByTestId('name-0').props.children).toBe('Tomato');
        expect(screen.getByTestId('row-1')).toBeTruthy();
        expect(screen.getByTestId('name-1').props.children).toBe('Salt');
    });

    it('passes error messages to respective rows and hides missing errors', () => {
        render(
            <IngredientListEditor
                ingredients={ingredients}
                errors={errors}
                onChange={onChange}
                onRemove={onRemove}
            />
        );
        expect(screen.getByTestId('error-name-0').props.children).toBe('Brak nazwy');
        expect(screen.queryByTestId('error-name-1')).toBeNull();
    });

    it('invokes onChange with correct args when change button pressed', () => {
        render(
            <IngredientListEditor
                ingredients={ingredients}
                errors={errors}
                onChange={onChange}
                onRemove={onRemove}
            />
        );
        fireEvent.press(screen.getByTestId('change-1'));
        expect(onChange).toHaveBeenCalledWith(1, ingredients[1]);
    });

    it('invokes onRemove with correct index when remove button pressed', () => {
        render(
            <IngredientListEditor
                ingredients={ingredients}
                errors={errors}
                onChange={onChange}
                onRemove={onRemove}
            />
        );
        fireEvent.press(screen.getByTestId('remove-0'));
        expect(onRemove).toHaveBeenCalledWith(0);
    });

    it('renders nothing when ingredients array is empty', () => {
        render(
            <IngredientListEditor
                ingredients={[]}
                onChange={onChange}
                onRemove={onRemove}
            />
        );
        expect(screen.queryByTestId(/^row-/)).toBeNull();
    });

    it('uses default empty errors array when errors prop is omitted', () => {
        render(
            <IngredientListEditor
                ingredients={ingredients}
                onChange={onChange}
                onRemove={onRemove}
            />
        );
        // No errors passed, so no error-name elements
        expect(screen.queryByTestId('error-name-0')).toBeNull();
        expect(screen.queryByTestId('error-name-1')).toBeNull();
    });

    it('falls back to index as key when ingredient name is empty', () => {
        const items = [{ name: '', quantity: 3, unit: 'pcs' }];
        render(
            <IngredientListEditor
                ingredients={items}
                onChange={onChange}
                onRemove={onRemove}
            />
        );
        // Should render one row with testID row-0
        expect(screen.getByTestId('row-0')).toBeTruthy();
    });
});
