// components/ui/__tests__/Accordion.test.tsx

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import Accordion from '../Accordion';

// Mock @expo/vector-icons Ionicons to a plain <Text> to avoid internal state issues
jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        Ionicons: (props: any) =>
            React.createElement(
                Text,
                { testID: props.testID || 'accordion-icon', ...props },
                props.name
            ),
    };
});

describe('Accordion', () => {
    it('renders the title', () => {
        const { getByText } = render(
            <Accordion title="My Title">
                <Text>Content</Text>
            </Accordion>
        );
        expect(getByText('My Title')).toBeTruthy();
    });

    it('shows down-chevron by default and hides content', () => {
        const { getByTestId, queryByText } = render(
            <Accordion title="My Title">
                <Text>Content</Text>
            </Accordion>
        );
        expect(getByTestId('accordion-icon').props.children).toBe('chevron-down');
        expect(queryByText('Content')).toBeNull();
    });

    it('toggles open state: shows content and up-chevron on first press', () => {
        const { getByText, getByTestId } = render(
            <Accordion title="My Title">
                <Text>Content</Text>
            </Accordion>
        );
        fireEvent.press(getByText('My Title'));
        expect(getByTestId('accordion-icon').props.children).toBe('chevron-up');
        expect(getByText('Content')).toBeTruthy();
    });

    it('toggles closed state: hides content and down-chevron on second press', () => {
        const { getByText, getByTestId, queryByText } = render(
            <Accordion title="My Title">
                <Text>Content</Text>
            </Accordion>
        );
        const header = getByText('My Title');
        // open
        fireEvent.press(header);
        // close
        fireEvent.press(header);
        expect(getByTestId('accordion-icon').props.children).toBe('chevron-down');
        expect(queryByText('Content')).toBeNull();
    });
});
