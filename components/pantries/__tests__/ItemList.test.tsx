import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import ItemList from '../ItemList';

describe('ItemList', () => {
    const items = [
        { id: '1', name: 'Mleko', category: 'Nabiał', quantity: 2, unit: 'szt', expiry_date: '2025-12-31' },
        { id: '2', name: 'Chleb', category: 'Pieczywo', quantity: 1, unit: 'szt', expiry_date: null },
    ];
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnQuantityChange = jest.fn();

    beforeEach(() => jest.clearAllMocks());

    it('renders header row correctly', () => {
        render(<ItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} onQuantityChange={mockOnQuantityChange} />);
        expect(screen.getByText('Produkt')).toBeTruthy();
        expect(screen.getByText('Kategoria')).toBeTruthy();
        expect(screen.getByText('Ilość')).toBeTruthy();
        expect(screen.getByText('Akcje')).toBeTruthy();
    });

    it('renders each item with name, category, quantity and unit', () => {
        render(<ItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} onQuantityChange={mockOnQuantityChange} />);
        items.forEach(item => {
            expect(screen.getByText(item.name)).toBeTruthy();
            expect(screen.getByText(item.category)).toBeTruthy();
            expect(screen.getByText(`${item.quantity} ${item.unit}`)).toBeTruthy();
        });
    });

    it('calls onQuantityChange with decreased quantity when minus is pressed', () => {
        render(<ItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} onQuantityChange={mockOnQuantityChange} />);
        const firstMinus = screen.getAllByText('➖')[0];
        fireEvent.press(firstMinus);
        expect(mockOnQuantityChange).toHaveBeenCalledWith('1', 1);
    });

    it('does not decrease quantity below zero', () => {
        const zeroItem = [{ id: '3', name: 'Woda', category: 'Napoje', quantity: 0, unit: 'l', expiry_date: null }];
        render(<ItemList items={zeroItem} onEdit={mockOnEdit} onDelete={mockOnDelete} onQuantityChange={mockOnQuantityChange} />);
        const minus = screen.getByText('➖');
        fireEvent.press(minus);
        expect(mockOnQuantityChange).toHaveBeenCalledWith('3', 0);
    });

    it('calls onQuantityChange with increased quantity when plus is pressed', () => {
        render(<ItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} onQuantityChange={mockOnQuantityChange} />);
        const firstPlus = screen.getAllByText('➕')[0];
        fireEvent.press(firstPlus);
        expect(mockOnQuantityChange).toHaveBeenCalledWith('1', 3);
    });

    it('calls onEdit when edit button is pressed', () => {
        render(<ItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} onQuantityChange={mockOnQuantityChange} />);
        const editButtons = screen.getAllByText('✏️');
        fireEvent.press(editButtons[0]);
        expect(mockOnEdit).toHaveBeenCalledWith(items[0]);
    });

    it('calls onDelete when delete button is pressed', () => {
        render(<ItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} onQuantityChange={mockOnQuantityChange} />);
        const deleteButtons = screen.getAllByText('🗑️');
        fireEvent.press(deleteButtons[1]);
        expect(mockOnDelete).toHaveBeenCalledWith('2');
    });
});
