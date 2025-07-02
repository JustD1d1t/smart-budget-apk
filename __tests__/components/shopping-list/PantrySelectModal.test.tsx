import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddItemForm from '../../../components/shopping-list/AddItemForm';
import { supabase } from '../../../lib/supabaseClient';

// suppress act warnings
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((msg) => {
        if (typeof msg === 'string' && msg.includes('not wrapped in act')) return;
        console.error(msg);
    });
});

// Mock ProductAutocomplete
jest.mock('../ProductAutocomplete', () => {
    const React = require('react');
    const { View, TextInput, Text } = require('react-native');
    return ({ value, onChange, error }) => (
        <View>
            <TextInput
                testID="product-autocomplete"
                value={value}
                placeholder="Wpisz produkt..."
                onChangeText={onChange}
            />
            {error && <Text testID="error-name">{error}</Text>}
        </View>
    );
});

// Mock Select component
jest.mock('../../ui/Select', () => ({
    __esModule: true,
    default: ({ value, onChange }) => {
        const React = require('react');
        const { View, Text, TouchableOpacity } = require('react-native');
        return (
            <View testID="unit-select">
                <TouchableOpacity testID="unit-kg" onPress={() => onChange('kg')}>
                    <Text>kg</Text>
                </TouchableOpacity>
                <Text testID="unit-value">{value}</Text>
            </View>
        );
    },
}));

describe('AddItemForm', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    const listId = 'list-1';
    let onItemAdded: jest.Mock;

    beforeEach(() => {
        onItemAdded = jest.fn();
        jest.spyOn(supabase, 'from').mockReturnValue({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn(),
        } as any);
    });

    it('shows validation errors when fields are empty', () => {
        const { getByText, getByTestId } = render(
            <AddItemForm listId={listId} onItemAdded={onItemAdded} />
        );
        fireEvent.press(getByText('Dodaj produkt'));
        expect(getByTestId('error-name').props.children).toBe('Podaj nazwę produktu.');
        expect(getByText('Podaj ilość.')).toBeTruthy();
    });

    it('submits valid data and calls onItemAdded', async () => {
        const mockData = { id: '1', name: 'Milk' };
        const single = jest.fn().mockResolvedValue({ data: mockData, error: null });
        (supabase.from as jest.Mock).mockReturnValue({ insert: () => ({ select: () => ({ single }) }) });

        const rendered = render(
            <AddItemForm listId={listId} onItemAdded={onItemAdded} />
        );
        const { getByTestId, getByText, getByPlaceholderText } = rendered;

        fireEvent.changeText(getByTestId('product-autocomplete'), 'Milk');
        fireEvent.changeText(getByPlaceholderText('np. 2'), '3');
        fireEvent.press(getByTestId('unit-kg'));
        fireEvent.press(getByText('Dodaj produkt'));

        await waitFor(() => {
            expect(onItemAdded).toHaveBeenCalledWith(mockData);
        });
    });

    it('shows alert on insert error', async () => {
        const single = jest.fn().mockResolvedValue({ data: null, error: new Error('fail') });
        (supabase.from as jest.Mock).mockReturnValue({ insert: () => ({ select: () => ({ single }) }) });
        const alertSpy = jest.spyOn(Alert, 'alert');

        const rendered = render(
            <AddItemForm listId={listId} onItemAdded={onItemAdded} />
        );
        const { getByTestId, getByText, getByPlaceholderText } = rendered;

        fireEvent.changeText(getByTestId('product-autocomplete'), 'Eggs');
        fireEvent.changeText(getByPlaceholderText('np. 2'), '2');
        fireEvent.press(getByText('Dodaj produkt'));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Błąd', 'Nie udało się dodać produktu.');
        });
    });
});
