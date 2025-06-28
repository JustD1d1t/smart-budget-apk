import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { FlatList } from 'react-native';
import ItemList from '../ItemList';

describe('ItemList', () => {
    const items = [
        { id: '1', name: 'Apple', quantity: 2, unit: 'kg', category: 'Fruits', bought: false },
        { id: '2', name: 'Bread', quantity: 1, unit: 'szt', category: 'Bakery', bought: true, recipe: 'Sandwich' },
    ];
    let onToggle: jest.Mock;
    let onEdit: jest.Mock;

    beforeEach(() => {
        onToggle = jest.fn();
        onEdit = jest.fn();
    });

    it('renders a FlatList with correct number of items', () => {
        const { UNSAFE_queryAllByType } = render(
            <ItemList items={items} onToggle={onToggle} onEdit={onEdit} />
        );
        const list = UNSAFE_queryAllByType(FlatList);
        expect(list.length).toBe(1);
    });

    it('displays item text correctly, including recipe if present', () => {
        const { getByText } = render(
            <ItemList items={items} onToggle={onToggle} onEdit={onEdit} />
        );
        expect(getByText('✅ Apple (Fruits) - 2 kg')).toBeTruthy();
        expect(getByText('✅ Bread (Bakery) - 1 szt (Sandwich)')).toBeTruthy();
    });

    it('calls onToggle with correct args when item pressed', () => {
        const { getByText } = render(
            <ItemList items={items} onToggle={onToggle} onEdit={onEdit} />
        );
        fireEvent.press(getByText('✅ Apple (Fruits) - 2 kg'));
        expect(onToggle).toHaveBeenCalledWith('1', false);

        fireEvent.press(getByText('✅ Bread (Bakery) - 1 szt (Sandwich)'));
        expect(onToggle).toHaveBeenCalledWith('2', true);
    });

    it('calls onEdit with correct item when edit button pressed', () => {
        const { getAllByText } = render(
            <ItemList items={items} onToggle={onToggle} onEdit={onEdit} />
        );
        const editButtons = getAllByText('Edytuj');
        expect(editButtons.length).toBe(2);
        fireEvent.press(editButtons[0]);
        expect(onEdit).toHaveBeenCalledWith(items[0]);
        fireEvent.press(editButtons[1]);
        expect(onEdit).toHaveBeenCalledWith(items[1]);
    });
});
