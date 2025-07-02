// components/ui/__tests__/Toast.test.tsx

import { render } from '@testing-library/react-native';
import { Animated, StyleSheet } from 'react-native'; // Importuj StyleSheet
import Toast from '../../../components/ui/Toast';

// Nie ma potrzeby mockowania useWindowDimensions tutaj, zrobimy to w beforeEach

describe('Toast Component', () => {
    beforeEach(() => {
        // Czyści poprzednie mocki
        jest.clearAllMocks();

        // Mockuj useWindowDimensions wewnątrz beforeEach, aby mieć pewność,
        // że jest aktywny dla każdego testu.
        jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({
            width: 360,
            height: 640,
        });

        // Mockuj animację
        jest.spyOn(Animated, 'spring').mockImplementation((_value, _config) => ({
            start: (cb?: () => void) => {
                if (cb) cb(); // Wywołaj callback, jeśli istnieje
                return { reset: () => { }, stop: () => { } }; // Zwróć obiekt z metodami, które mogą być wywołane
            },
        }));
    });

    it('renders message text', () => {
        const { getByTestId } = render(<Toast message="Hello!" type="success" />);
        expect(getByTestId('toast-text').props.children).toBe('Hello!');
    });

    it('applies green background for success', () => {
        const { getByTestId } = render(<Toast message="OK" type="success" />);
        const root = getByTestId('toast-root');

        // Użyj StyleSheet.flatten do poprawnego połączenia stylów
        const flatStyle = StyleSheet.flatten(root.props.style);

        expect(flatStyle.backgroundColor).toBe('#2ecc71');
    });

    it('applies red background for error', () => {
        const { getByTestId } = render(<Toast message="Err" type="error" />);
        const root = getByTestId('toast-root');

        // Użyj StyleSheet.flatten do poprawnego połączenia stylów
        const flatStyle = StyleSheet.flatten(root.props.style);

        expect(flatStyle.backgroundColor).toBe('#e74c3c');
    });

    it('sets a correct width based on window dimensions', () => {
        const { getByTestId } = render(<Toast message="W" type="success" />);
        const root = getByTestId('toast-root');

        // Użyj StyleSheet.flatten do poprawnego połączenia stylów
        const flatStyle = StyleSheet.flatten(root.props.style);

        // Oczekiwana szerokość to szerokość okna (360) minus 40
        const expectedWidth = 360 - 40;

        expect(flatStyle.width).toBe(expectedWidth);
    });

    it('triggers Animated.spring on mount with correct config', () => {
        render(<Toast message="T" type="success" />);
        expect(Animated.spring).toHaveBeenCalledTimes(1);

        const [, config] = (Animated.spring as jest.Mock).mock.calls[0];
        expect(config).toMatchObject({ toValue: 0, useNativeDriver: true });
    });
});