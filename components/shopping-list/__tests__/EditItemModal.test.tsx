import { fireEvent, render } from '@testing-library/react-native';
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
        const { getByText, getByPlaceholderText } = renderModal();
        expect(getByText('✏️ Edytuj produkt')).toBeTruthy();
        expect(getByPlaceholderText('Nazwa produktu').props.value).toBe('Apple');
        expect(getByPlaceholderText('Ilość').props.value).toBe('5');
    });

    it('calls onChange when name changes', () => {
        const { getByPlaceholderText } = renderModal();
        const nameInput = getByPlaceholderText('Nazwa produktu');
        fireEvent.changeText(nameInput, 'Banana');
        expect(onChange).toHaveBeenCalledWith({ ...item, name: 'Banana' });
    });

    it('calls onChange when quantity changes', () => {
        const { getByPlaceholderText } = renderModal();
        const qtyInput = getByPlaceholderText('Ilość');
        fireEvent.changeText(qtyInput, '3');
        expect(onChange).toHaveBeenCalledWith({ ...item, quantity: 3 });
    });

    it('calls onChange when unit changes via Picker', () => {
        const { getByTestId } = renderModal();
        const picker = getByTestId('unit-picker');
        fireEvent(picker, 'onValueChange', 'l');
        expect(onChange).toHaveBeenCalledWith({ ...item, unit: 'l' });
    });

    it('calls onClose when cancel pressed', () => {
        const { getByText } = renderModal();
        fireEvent.press(getByText('Anuluj'));
        expect(onClose).toHaveBeenCalled();
    });

    it('calls onSave when save pressed', () => {
        const { getByText } = renderModal();
        fireEvent.press(getByText('💾 Zapisz'));
        expect(onSave).toHaveBeenCalled();
    });
});
