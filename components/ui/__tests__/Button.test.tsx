// components/ui/__tests__/Button.test.tsx

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Button from '../Button';

describe('Button Component', () => {
    it('renders children correctly', () => {
        const { getByText } = render(
            <Button onPress={() => { }}>Click Me</Button>
        );
        expect(getByText('Click Me')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPressMock = jest.fn();
        const { getByTestId } = render(
            <Button onPress={onPressMock}>Pressable</Button>
        );
        fireEvent.press(getByTestId('button-root'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
        const onPressMock = jest.fn();
        const { getByTestId } = render(
            <Button onPress={onPressMock} disabled>
                Disabled
            </Button>
        );
        fireEvent.press(getByTestId('button-root'));
        expect(onPressMock).not.toHaveBeenCalled();
    });

    it('applies neutral variant styles by default', () => {
        const { getByTestId, getByText } = render(
            <Button onPress={() => { }}>Neutral</Button>
        );
        expect(getByTestId('button-root')).toHaveStyle({ backgroundColor: '#ccc' });
        expect(getByText('Neutral')).toHaveStyle({ color: '#000' });
    });

    it('applies danger variant styles', () => {
        const { getByTestId, getByText } = render(
            <Button onPress={() => { }} variant="danger">
                Danger
            </Button>
        );
        expect(getByTestId('button-root')).toHaveStyle({ backgroundColor: '#e74c3c' });
        expect(getByText('Danger')).toHaveStyle({ color: '#fff' });
    });

    it('applies confirm variant styles', () => {
        const { getByTestId, getByText } = render(
            <Button onPress={() => { }} variant="confirm">
                Confirm
            </Button>
        );
        expect(getByTestId('button-root')).toHaveStyle({ backgroundColor: '#2ecc71' });
        expect(getByText('Confirm')).toHaveStyle({ color: '#fff' });
    });

    it('applies warning variant styles', () => {
        const { getByTestId, getByText } = render(
            <Button onPress={() => { }} variant="warning">
                Warning
            </Button>
        );
        expect(getByTestId('button-root')).toHaveStyle({ backgroundColor: '#f39c12' });
        expect(getByText('Warning')).toHaveStyle({ color: '#000' });
    });

    it('applies disabled styles to button and text', () => {
        const { getByTestId, getByText } = render(
            <Button onPress={() => { }} disabled>
                Disabled Style
            </Button>
        );
        expect(getByTestId('button-root')).toHaveStyle({ opacity: 0.5 });
        expect(getByText('Disabled Style')).toHaveStyle({ opacity: 0.7 });
    });

    it('merges custom styles', () => {
        const { getByTestId } = render(
            <Button onPress={() => { }} style={{ margin: 10 }}>
                Styled
            </Button>
        );
        expect(getByTestId('button-root')).toHaveStyle({ margin: 10 });
    });
});
