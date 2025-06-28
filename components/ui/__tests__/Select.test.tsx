// components/ui/__tests__/Select.test.tsx

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Select, { SelectOption } from '../Select';

// Mockujemy Picker i Picker.Item
jest.mock('@react-native-picker/picker', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');

    const Picker = ({ selectedValue, onValueChange, children, testID }: any) => (
        <View testID={testID || 'mock-picker'}>
            {React.Children.map(children, (child: any) =>
                React.cloneElement(child, {
                    ...child.props,
                    onPress: () => onValueChange(child.props.value),
                })
            )}
        </View>
    );

    Picker.Item = ({ label, value, enabled, ...rest }: any) => {
        const isDisabled = enabled === false;
        return (
            <TouchableOpacity
                {...rest}
                testID={value === '' ? 'item-placeholder' : `item-${value}`}
                disabled={isDisabled}
            >
                <Text>{label}</Text>
            </TouchableOpacity>
        );
    };

    return { Picker };
});

describe('Select Component', () => {
    const options: SelectOption[] = [
        { label: 'Option A', value: 'A' },
        { label: 'Option B', value: 'B' },
    ];
    const placeholder = 'Choose...';

    it('renders label when provided', () => {
        const { getByText } = render(
            <Select
                label="My Label"
                value=""
                options={options}
                onChange={() => { }}
                placeholder={placeholder}
            />
        );
        expect(getByText('My Label')).toBeTruthy();
    });

    it('renders placeholder as disabled first item', () => {
        const { getByTestId, getByText } = render(
            <Select
                value=""
                options={options}
                onChange={() => { }}
                placeholder={placeholder}
            />
        );
        expect(getByText(placeholder)).toBeTruthy();
        const ph = getByTestId('item-placeholder');
        expect(ph.props.accessibilityState?.disabled).toBe(true);
    });

    it('renders all options', () => {
        const { getByText, getByTestId } = render(
            <Select value="" options={options} onChange={() => { }} />
        );
        expect(getByText('Option A')).toBeTruthy();
        expect(getByText('Option B')).toBeTruthy();
        expect(getByTestId('item-A')).toBeTruthy();
        expect(getByTestId('item-B')).toBeTruthy();
    });

    it('calls onChange with selected value', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <Select value="" options={options} onChange={onChange} />
        );
        fireEvent.press(getByTestId('item-B'));
        expect(onChange).toHaveBeenCalledWith('B');
    });

    it('applies error style and shows error text when error prop passed', () => {
        const { getByText, getByTestId } = render(
            <Select value="" options={options} onChange={() => { }} error="Required" />
        );
        expect(getByText('Required')).toBeTruthy();
        const pickerContainer = getByTestId('select-picker-container');
        const styleArr = pickerContainer.props.style;
        expect(styleArr).toEqual(
            expect.arrayContaining([expect.objectContaining({ borderColor: '#dc2626' })])
        );
    });

    it('does not render label or error when not provided, and has default border', () => {
        const { queryByText, getByTestId } = render(
            <Select value="" options={options} onChange={() => { }} />
        );
        expect(queryByText('My Label')).toBeNull();
        expect(queryByText('Required')).toBeNull();
        const pickerContainer = getByTestId('select-picker-container');
        const styleArr = pickerContainer.props.style;
        expect(styleArr).toEqual(
            expect.arrayContaining([expect.objectContaining({ borderColor: '#ccc' })])
        );
    });

    it('wraps everything in select-container', () => {
        const { getByTestId } = render(
            <Select value="" options={options} onChange={() => { }} />
        );
        expect(getByTestId('select-container')).toBeTruthy();
    });
});
