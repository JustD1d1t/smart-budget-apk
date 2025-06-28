// components/expenses/__tests__/ExpenseFilters.test.tsx

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import ExpenseFilters from '../ExpenseFilters';

// Krok 1: Mockowanie zależności
// Mockujemy bazę danych, aby zapewnić stałe i przewidywalne opcje dla kategorii.
jest.mock('../../../data/productsDb', () => ({
    productsDb: {
        'Jedzenie': [],
        'Transport': [],
        'Mieszkanie': [],
        'Rozrywka': [],
    },
}));

// Mockujemy komponenty UI (Input i Select), aby testować ExpenseFilters w izolacji.
// Pozwala to na łatwe sprawdzanie przekazywanych propsów i symulowanie zdarzeń
// bez testowania wewnętrznej implementacji tych komponentów.
jest.mock('../../ui/Input', () => (props) => {
    const { View, Text, TextInput } = require('react-native');
    return (
        <View>
            <Text>{props.label}</Text>
            <TextInput
                testID={`input-${props.label}`} // Używamy testID do łatwego dostępu
                value={props.value}
                placeholder={props.placeholder}
                onChangeText={props.onChangeText}
            />
        </View>
    );
});

jest.mock('../../ui/Select', () => (props) => {
    const { View, Text } = require('react-native');
    // W teście będziemy bezpośrednio wywoływać `props.onChange`
    return (
        <View testID={`select-${props.label}`} {...props}>
            <Text>{props.label}</Text>
            <Text>{props.value || props.placeholder}</Text>
        </View>
    );
});


describe('ExpenseFilters Component', () => {
    // Krok 2: Przygotowanie domyślnych propsów i mocków funkcji
    const mockProps = {
        filterCategory: '',
        onFilterCategoryChange: jest.fn(),
        sortOption: 'date_desc',
        onSortOptionChange: jest.fn(),
        startDate: '',
        onStartDateChange: jest.fn(),
        endDate: '',
        onEndDateChange: jest.fn(),
    };

    // Resetujemy wszystkie mocki przed każdym testem, aby zapewnić czyste środowisko
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // === Testy renderowania ===

    it('should render all filter controls without crashing', () => {
        render(<ExpenseFilters {...mockProps} />);

        // Sprawdzamy, czy wszystkie etykiety (a tym samym kontrolki) są obecne
        expect(screen.getByText('Kategoria')).toBeTruthy();
        expect(screen.getByText('Sortowanie')).toBeTruthy();
        expect(screen.getByText('Data od')).toBeTruthy();
        expect(screen.getByText('Data do')).toBeTruthy();
    });

    it('should display initial values passed via props', () => {
        const customProps = {
            ...mockProps,
            filterCategory: 'Jedzenie',
            sortOption: 'amount_asc',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
        };
        render(<ExpenseFilters {...customProps} />);

        // Sprawdzamy, czy komponenty `Select` wyświetlają poprawne wartości
        expect(screen.getByText('Jedzenie')).toBeTruthy();
        // Nasz mock dla Select wyświetli wartość, jeśli jest, lub placeholder
        // Możemy też sprawdzić propsy
        expect(screen.getByTestId('select-Sortowanie').props.value).toBe('amount_asc');

        // Sprawdzamy, czy komponenty `Input` mają poprawne wartości
        expect(screen.getByTestId('input-Data od').props.value).toBe('2024-01-01');
        expect(screen.getByTestId('input-Data do').props.value).toBe('2024-01-31');
    });

    it('should display placeholders when initial values are empty', () => {
        render(<ExpenseFilters {...mockProps} />);

        // Sprawdzamy, czy komponenty `Select` wyświetlają placeholdery
        expect(screen.getByText('-- wszystkie --')).toBeTruthy();
        // `sortOption` ma wartość domyślną, więc nie zobaczymy placeholdera
        expect(screen.queryByText('Wybierz...')).toBeNull();

        // Sprawdzamy, czy `Input` mają placeholdery (testując propsy w mocku)
        expect(screen.getByTestId('input-Data od').props.placeholder).toBe('YYYY-MM-DD');
        expect(screen.getByTestId('input-Data do').props.placeholder).toBe('YYYY-MM-DD');
    });


    // === Testy przekazywania propsów ===

    it('should pass the correct category options to the Category Select', () => {
        render(<ExpenseFilters {...mockProps} />);
        const categorySelect = screen.getByTestId('select-Kategoria');

        const expectedOptions = [
            { label: 'Jedzenie', value: 'Jedzenie' },
            { label: 'Transport', value: 'Transport' },
            { label: 'Mieszkanie', value: 'Mieszkanie' },
            { label: 'Rozrywka', value: 'Rozrywka' },
        ];

        expect(categorySelect.props.options).toEqual(expectedOptions);
    });

    it('should pass the correct sort options to the Sort Select', () => {
        render(<ExpenseFilters {...mockProps} />);
        const sortSelect = screen.getByTestId('select-Sortowanie');

        expect(sortSelect.props.options).toHaveLength(6);
        expect(sortSelect.props.options).toContainEqual({ label: "Kwota (rosnąco)", value: "amount_asc" });
    });


    // === Testy interakcji użytkownika ===

    it('should call onFilterCategoryChange when category is changed', () => {
        render(<ExpenseFilters {...mockProps} />);
        const categorySelect = screen.getByTestId('select-Kategoria');

        categorySelect.props.onChange('Transport');

        expect(mockProps.onFilterCategoryChange).toHaveBeenCalledTimes(1);
        expect(mockProps.onFilterCategoryChange).toHaveBeenCalledWith('Transport');
    });

    it('should call onSortOptionChange when sort option is changed', () => {
        render(<ExpenseFilters {...mockProps} />);
        const sortSelect = screen.getByTestId('select-Sortowanie');

        sortSelect.props.onChange('category_asc');

        expect(mockProps.onSortOptionChange).toHaveBeenCalledTimes(1);
        expect(mockProps.onSortOptionChange).toHaveBeenCalledWith('category_asc');
    });

    it('should call onStartDateChange when text is entered in the "Data od" input', () => {
        render(<ExpenseFilters {...mockProps} />);
        const startDateInput = screen.getByTestId('input-Data od');

        fireEvent.changeText(startDateInput, '2024-05-20');

        expect(mockProps.onStartDateChange).toHaveBeenCalledTimes(1);
        expect(mockProps.onStartDateChange).toHaveBeenCalledWith('2024-05-20');
    });

    it('should call onEndDateChange when text is entered in the "Data do" input', () => {
        render(<ExpenseFilters {...mockProps} />);
        const endDateInput = screen.getByTestId('input-Data do');

        fireEvent.changeText(endDateInput, '2024-05-31');

        expect(mockProps.onEndDateChange).toHaveBeenCalledTimes(1);
        expect(mockProps.onEndDateChange).toHaveBeenCalledWith('2024-05-31');
    });
});