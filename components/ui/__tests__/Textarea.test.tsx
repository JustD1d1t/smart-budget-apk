import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Textarea from '../Textarea';

describe('Textarea Component', () => {
    it('renders without label or error by default', () => {
        const { queryByText, getByTestId } = render(
            <Textarea value="abc" onChangeText={() => { }} />
        );
        expect(queryByText('Label')).toBeNull();
        expect(queryByText('Error!')).toBeNull();

        const input = getByTestId('textarea-input');
        expect(input.props.multiline).toBe(true);
        expect(input.props.numberOfLines).toBe(4);
        expect(input.props.textAlignVertical).toBe('top');
        expect(input.props.value).toBe('abc');
    });

    it('renders label when provided', () => {
        const { getByText } = render(
            <Textarea label="My Label" value="" onChangeText={() => { }} />
        );
        expect(getByText('My Label')).toBeTruthy();
    });

    it('renders error text and red border when error prop passed', () => {
        const { getByText, getByTestId } = render(
            <Textarea error="Error!" value="" onChangeText={() => { }} />
        );
        expect(getByText('Error!')).toBeTruthy();
        const input = getByTestId('textarea-input');
        const style = input.props.style;
        expect(style).toEqual(
            expect.objectContaining({ borderColor: '#e74c3c' })
        );
    });

    it('uses default gray border when no error', () => {
        const { getByTestId } = render(
            <Textarea value="" onChangeText={() => { }} />
        );
        const input = getByTestId('textarea-input');
        const style = input.props.style;
        expect(style).toEqual(
            expect.objectContaining({ borderColor: '#ccc' })
        );
    });

    it('calls onChangeText when text changes', () => {
        const onChangeText = jest.fn();
        const { getByTestId } = render(
            <Textarea value="" onChangeText={onChangeText} />
        );
        fireEvent.changeText(getByTestId('textarea-input'), 'new text');
        expect(onChangeText).toHaveBeenCalledWith('new text');
    });

    it('respects secureTextEntry if passed', () => {
        const { getByTestId } = render(
            <Textarea secureTextEntry value="secret" onChangeText={() => { }} />
        );
        const input = getByTestId('textarea-input');
        expect(input.props.secureTextEntry).toBe(true);
    });
});
