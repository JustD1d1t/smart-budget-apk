import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import EditItemModal from '../EditItemModal';

describe('EditItemModal', () => {
    const item = { id: '1', name: 'Apple', quantity: 5, unit: 'kg' };
    let onChange: jest.Mock;
    let onClose: jest.Mock;
    let onSave: jest.Mock;

    beforeEach(() => {
        onChange = jest.fn();
        onClose = jest.fn();
        onSave = jest.fn();
    });

    const renderModal = () =>
        render(
            <EditItemModal item={item} onChange={onChange} onClose={onClose} onSave={onSave} />
        );

    it('renders modal with title and inputs', () => {
        renderModal();
        expect(screen.getByText('✏️ Edytuj produkt')).toBeTruthy();
        expect(screen.getByPlaceholderText('Nazwa produktu').props.value).toBe('Apple');
        expect(screen.getByPlaceholderText('Ilość').props.value).toBe('5');
    });

    it('calls onChange when name changes', () => {
        renderModal();
        fireEvent.changeText(screen.getByPlaceholderText('Nazwa produktu'), 'Banana');
        expect(onChange).toHaveBeenCalledWith({ ...item, name: 'Banana' });
    });

    it('calls onChange when quantity changes to numeric', () => {
        renderModal();
        fireEvent.changeText(screen.getByPlaceholderText('Ilość'), '3');
        expect(onChange).toHaveBeenCalledWith({ ...item, quantity: 3 });
    });

    it('sets quantity to 0 when non-numeric quantity entered', () => {
        renderModal();
        fireEvent.changeText(screen.getByPlaceholderText('Ilość'), 'abc');
        expect(onChange).toHaveBeenCalledWith({ ...item, quantity: 0 });
    });

    it('calls onChange when unit changes via Picker', () => {
        renderModal();
        const picker = screen.getByTestId('unit-picker');
        fireEvent(picker, 'onValueChange', 'l');
        expect(onChange).toHaveBeenCalledWith({ ...item, unit: 'l' });
    });

    it('calls onClose when cancel pressed', () => {
        renderModal();
        fireEvent.press(screen.getByText('Anuluj'));
        expect(onClose).toHaveBeenCalled();
    });

    it('calls onSave when save pressed', () => {
        renderModal();
        fireEvent.press(screen.getByText('💾 Zapisz'));
        expect(onSave).toHaveBeenCalled();
    });
});
