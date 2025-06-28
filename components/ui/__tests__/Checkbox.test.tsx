// components/ui/__tests__/Checkbox.test.tsx

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Checkbox from '../Checkbox';

describe('Checkbox Component', () => {
    it('renders the label', () => {
        const { getByText } = render(
            <Checkbox label="Accept terms" checked={false} onChange={() => { }} />
        );
        expect(getByText('Accept terms')).toBeTruthy();
    });

    it('renders unchecked box by default', () => {
        const { getByTestId } = render(
            <Checkbox label="Label" checked={false} onChange={() => { }} />
        );
        const box = getByTestId('checkbox-box');
        expect(box).toHaveStyle({ backgroundColor: '#fff' });
    });

    it('renders checked box when checked=true', () => {
        const { getByTestId } = render(
            <Checkbox label="Label" checked={true} onChange={() => { }} />
        );
        const box = getByTestId('checkbox-box');
        expect(box).toHaveStyle({ backgroundColor: '#2ecc71' });
    });

    it('calls onChange with true when pressed while unchecked', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <Checkbox label="Click me" checked={false} onChange={onChange} />
        );
        fireEvent.press(getByTestId('checkbox-pressable'));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange with false when pressed while checked', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <Checkbox label="Click me" checked={true} onChange={onChange} />
        );
        fireEvent.press(getByTestId('checkbox-pressable'));
        expect(onChange).toHaveBeenCalledWith(false);
    });

    it('maintains layout style on Pressable', () => {
        const { getByTestId } = render(
            <Checkbox label="Layout" checked={false} onChange={() => { }} />
        );
        const pressable = getByTestId('checkbox-pressable');
        expect(pressable).toHaveStyle({
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        });
    });

    it('supports dynamic label changes', () => {
        const { rerender, getByText, queryByText } = render(
            <Checkbox label="First" checked={false} onChange={() => { }} />
        );
        expect(getByText('First')).toBeTruthy();

        rerender(<Checkbox label="Second" checked={false} onChange={() => { }} />);
        expect(queryByText('First')).toBeNull();
        expect(getByText('Second')).toBeTruthy();
    });
});
