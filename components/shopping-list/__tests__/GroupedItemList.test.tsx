import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Collapsible from 'react-native-collapsible';
import GroupedItemList from '../GroupedItemList';

describe('GroupedItemList', () => {
    const items = [
        { id: '1', name: 'Apple', quantity: 2, unit: 'kg', category: 'Fruits', bought: false },
        { id: '2', name: 'Banana', quantity: 3, unit: 'kg', category: 'Fruits', bought: true },
        { id: '3', name: 'Carrot', quantity: 1, unit: 'kg', category: 'Vegetables', bought: false },
    ];
    let onToggle: jest.Mock;
    let onEdit: jest.Mock;

    beforeEach(() => {
        onToggle = jest.fn();
        onEdit = jest.fn();
    });

    it('renders accordion headers for each category', () => {
        const { getByText } = render(
            <GroupedItemList items={items} filterCategory="wszystkie" onToggle={onToggle} onEdit={onEdit} />
        );
        expect(getByText('Fruits')).toBeTruthy();
        expect(getByText('Vegetables')).toBeTruthy();
    });

    it('initially collapses all sections', () => {
        const { UNSAFE_getAllByType } = render(
            <GroupedItemList items={items} filterCategory="wszystkie" onToggle={onToggle} onEdit={onEdit} />
        );
        const collapsibles = UNSAFE_getAllByType(Collapsible);
        collapsibles.forEach(node => {
            expect(node.props.collapsed).toBe(true);
        });
    });

    it('expands a section when its header is pressed', () => {
        const { getByText, UNSAFE_getAllByType } = render(
            <GroupedItemList items={items} filterCategory="wszystkie" onToggle={onToggle} onEdit={onEdit} />
        );
        fireEvent.press(getByText('Fruits'));
        const collapsibles = UNSAFE_getAllByType(Collapsible);
        // First collapsible corresponds to Fruits
        expect(collapsibles[0].props.collapsed).toBe(false);
    });

    it('calls onToggle when an item info is pressed', () => {
        const { getByText } = render(
            <GroupedItemList items={items} filterCategory="wszystkie" onToggle={onToggle} onEdit={onEdit} />
        );
        fireEvent.press(getByText('Fruits'));
        fireEvent.press(getByText('Apple (2 kg)'));
        expect(onToggle).toHaveBeenCalledWith('1', false);
    });

    it('calls onEdit when specific Edit button pressed', () => {
        const { getByText, getAllByText } = render(
            <GroupedItemList items={items} filterCategory="wszystkie" onToggle={onToggle} onEdit={onEdit} />
        );
        fireEvent.press(getByText('Fruits'));
        const editButtons = getAllByText('Edytuj');
        fireEvent.press(editButtons[0]); // first item's edit
        expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: '1', name: 'Apple' }));
    });

    it('filters by category when filterCategory is set', () => {
        const { queryByText, getByText } = render(
            <GroupedItemList items={items} filterCategory="Vegetables" onToggle={onToggle} onEdit={onEdit} />
        );
        expect(queryByText('Fruits')).toBeNull();
        expect(getByText('Vegetables')).toBeTruthy();
    });
});
