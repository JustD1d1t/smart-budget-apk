// components/ui/__tests__/Input.test.tsx

import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Input from '../Input';

// Mock DateTimePicker – rozpakowujemy props i przekazujemy je dalej
jest.mock('@react-native-community/datetimepicker', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return (props: any) => (
        <View
            testID={props.testID || 'date-picker'}
            {...props}                             // <- dzięki temu maximumDate trafia do props
            onStartShouldSetResponder={() => true}
            onResponderRelease={() => props.onChange(null, new Date('2025-01-02'))}
        >
            <Text testID="datepicker-value">
                {props.value.toISOString()}
            </Text>
        </View>
    );
});

describe('Input Component', () => {
    it('renders label and error text', () => {
        const { getByText } = render(
            <Input label="Username" error="Required" value="" onChangeText={() => { }} />
        );
        expect(getByText('Username')).toBeTruthy();
        expect(getByText('Required')).toBeTruthy();
    });

    it('renders TextInput for text type with secure props', () => {
        const onChangeText = jest.fn();
        const { getByTestId } = render(
            <Input
                value="secret"
                onChangeText={onChangeText}
                secureTextEntry
                testID="input-text"
            />
        );
        const input = getByTestId('input-text');
        expect(input.props.secureTextEntry).toBe(true);
        expect(input.props.textContentType).toBe('password');
        expect(input.props.autoComplete).toBe('password');
        expect(input.props.autoCorrect).toBe(false);
    });

    it('calls onChangeText when typing in text input', () => {
        const onChangeText = jest.fn();
        const { getByTestId } = render(
            <Input value="old" onChangeText={onChangeText} testID="input-text" />
        );
        fireEvent.changeText(getByTestId('input-text'), 'new');
        expect(onChangeText).toHaveBeenCalledWith('new');
    });

    it('renders date placeholder and hides picker initially', () => {
        const { getByText, queryByTestId } = render(
            <Input type="date" value="" onChangeText={() => { }} />
        );
        expect(getByText('YYYY-MM-DD')).toBeTruthy();
        expect(queryByTestId('date-picker')).toBeNull();
    });

    it('shows DateTimePicker on press and passes maximumDate', () => {
        const { getByText, getByTestId } = render(
            <Input
                type="date"
                value="2025-06-30"
                onChangeText={() => { }}
                maximumDate={new Date('2025-07-01')}
            />
        );
        fireEvent.press(getByText('2025-06-30'));
        const picker = getByTestId('date-picker');
        expect(picker).toBeTruthy();
        // teraz props.maximumDate istnieje
        expect(picker.props.maximumDate.toISOString()).toBe(
            new Date('2025-07-01').toISOString()
        );
    });

    it('calls onChangeText with ISO date when a date is picked', () => {
        const onChangeText = jest.fn();
        const { getByText, getByTestId } = render(
            <Input
                type="date"
                value="2025-06-30"
                onChangeText={onChangeText}
            />
        );
        fireEvent.press(getByText('2025-06-30'));
        act(() => {
            fireEvent(getByTestId('date-picker'), 'responderRelease');
        });
        expect(onChangeText).toHaveBeenCalledWith('2025-01-02');
    });
});
