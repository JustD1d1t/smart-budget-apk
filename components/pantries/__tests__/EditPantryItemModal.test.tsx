import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import EditPantryItemModal from '../EditPantryItemModal';

// Mock Picker to support testID identification
jest.mock('@react-native-picker/picker', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    const Picker = ({ children, onValueChange, selectedValue, testID }) => (
        <View testID={testID} selectedValue={selectedValue} onValueChange={onValueChange}>
            {React.Children.map(children, child => (
                <TouchableOpacity
                    testID={`item-${child.props.value}`}
                    onPress={() => onValueChange(child.props.value)}
                >
                    <Text>{child.props.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
    Picker.Item = ({ label, value }) => <Text label={label} value={value} />;
    return { Picker };
});

describe('EditPantryItemModal', () => {
    const initialItem = {
        id: '1',
        pantry_id: 'pantry-1',
        name: 'Mleko',
        category: 'żywność',
        quantity: 2,
        unit: 'szt',
        expiry_date: '2025-12-31',
    };
    const mockOnChange = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with initial values', () => {
        render(
            <EditPantryItemModal
                item={initialItem}
                onChange={mockOnChange}
                onSave={mockOnSave}
                onClose={mockOnClose}
            />
        );

        // Check TextInputs
        expect(screen.getByPlaceholderText('Nazwa produktu').props.value).toBe('Mleko');
        expect(screen.getByPlaceholderText('Ilość').props.value).toBe('2');
        expect(screen.getByPlaceholderText('Data przydatności (YYYY-MM-DD)').props.value).toBe('2025-12-31');

        // Pickers should render
        expect(screen.getByTestId('picker-category')).toBeTruthy();
        expect(screen.getByTestId('picker-unit')).toBeTruthy();

        // Buttons
        expect(screen.getByText('Anuluj')).toBeTruthy();
        expect(screen.getByText('💾 Zapisz')).toBeTruthy();
    });

    it('calls onChange when name changes', () => {
        render(
            <EditPantryItemModal
                item={initialItem}
                onChange={mockOnChange}
                onSave={mockOnSave}
                onClose={mockOnClose}
            />
        );
        fireEvent.changeText(screen.getByPlaceholderText('Nazwa produktu'), 'Chleb');
        expect(mockOnChange).toHaveBeenCalledWith({ ...initialItem, name: 'Chleb' });
    });

    it('calls onChange when category changes', () => {
        render(
            <EditPantryItemModal
                item={initialItem}
                onChange={mockOnChange}
                onSave={mockOnSave}
                onClose={mockOnClose}
            />
        );
        const categoryPicker = screen.getByTestId('picker-category');
        fireEvent(categoryPicker, 'onValueChange', 'chemia');
        expect(mockOnChange).toHaveBeenCalledWith({ ...initialItem, category: 'chemia' });
    });

    it('calls onChange when quantity changes', () => {
        render(
            <EditPantryItemModal
                item={initialItem}
                onChange={mockOnChange}
                onSave={mockOnSave}
                onClose={mockOnClose}
            />
        );
        fireEvent.changeText(screen.getByPlaceholderText('Ilość'), '5');
        expect(mockOnChange).toHaveBeenCalledWith({ ...initialItem, quantity: 5 });
    });

    it('calls onChange when unit changes', () => {
        render(
            <EditPantryItemModal
                item={initialItem}
                onChange={mockOnChange}
                onSave={mockOnSave}
                onClose={mockOnClose}
            />
        );
        const unitPicker = screen.getByTestId('picker-unit');
        fireEvent(unitPicker, 'onValueChange', 'kg');
        expect(mockOnChange).toHaveBeenCalledWith({ ...initialItem, unit: 'kg' });
    });

    it('calls onChange when expiry date changes', () => {
        render(
            <EditPantryItemModal
                item={initialItem}
                onChange={mockOnChange}
                onSave={mockOnSave}
                onClose={mockOnClose}
            />
        );
        fireEvent.changeText(
            screen.getByPlaceholderText('Data przydatności (YYYY-MM-DD)'),
            ''
        );
        expect(mockOnChange).toHaveBeenCalledWith({ ...initialItem, expiry_date: null });
    });

    it('calls onClose when cancel button is pressed', () => {
        render(
            <EditPantryItemModal
                item={initialItem}
                onChange={mockOnChange}
                onSave={mockOnSave}
                onClose={mockOnClose}
            />
        );
        fireEvent.press(screen.getByText('Anuluj'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onSave when save button is pressed', () => {
        render(
            <EditPantryItemModal
                item={initialItem}
                onChange={mockOnChange}
                onSave={mockOnSave}
                onClose={mockOnClose}
            />
        );
        fireEvent.press(screen.getByText('💾 Zapisz'));
        expect(mockOnSave).toHaveBeenCalled();
    });
});
