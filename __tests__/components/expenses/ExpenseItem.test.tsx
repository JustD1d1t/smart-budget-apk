// components/expenses/__tests__/ExpenseItem.test.tsx

import { fireEvent, render, screen } from '@testing-library/react-native';
import ExpenseItem from '../../../components/expenses/ExpenseItem';
import { Expense } from '../../../stores/expensesStore';

describe('ExpenseItem Component', () => {
    // Przygotowanie mockowych danych i funkcji, które będą używane w testach
    const mockExpense: Expense = {
        id: 'exp123',
        store: 'Lokalny sklep',
        amount: 79.99,
        date: '2025-06-27',
        category: 'Artykuły spożywcze',
        // Poniższe pola mogą być częścią typu Expense, ale nie są używane w komponencie
        // products: [], 
    };

    const mockOnPress = jest.fn();

    // Czyszczenie mocków przed każdym testem
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // === Testy renderowania ===

    it('should render all expense details correctly', () => {
        render(<ExpenseItem expense={mockExpense} />);

        // Sprawdzamy, czy wszystkie elementy tekstowe są widoczne
        expect(screen.getByText('Lokalny sklep')).toBeTruthy();
        expect(screen.getByText('2025-06-27')).toBeTruthy();
        expect(screen.getByText('Artykuły spożywcze')).toBeTruthy();
    });

    it('should format the amount correctly to two decimal places with "zł"', () => {
        render(<ExpenseItem expense={mockExpense} />);

        // Kwota powinna być sformatowana do "79.99 zł"
        const expectedAmountString = mockExpense.amount.toFixed(2) + ' zł';
        expect(screen.getByText(expectedAmountString)).toBeTruthy();
    });

    it('should correctly format an amount with one decimal place', () => {
        const expenseWithOneDecimal = { ...mockExpense, amount: 50.5 };
        render(<ExpenseItem expense={expenseWithOneDecimal} />);

        // Kwota 50.5 powinna zostać sformatowana do "50.50 zł"
        expect(screen.getByText('50.50 zł')).toBeTruthy();
    });

    it('should correctly format an integer amount', () => {
        const expenseWithIntAmount = { ...mockExpense, amount: 100 };
        render(<ExpenseItem expense={expenseWithIntAmount} />);

        // Kwota 100 powinna zostać sformatowana do "100.00 zł"
        expect(screen.getByText('100.00 zł')).toBeTruthy();
    });


    // === Testy interakcji ===

    it('should call onPress callback when the item is pressed', () => {
        // Renderujemy CAŁY komponent ExpenseItem, przekazując mu potrzebne propsy.
        render(<ExpenseItem expense={mockExpense} onPress={mockOnPress} />);

        // Znajdujemy element wewnątrz komponentu, aby go nacisnąć.
        // Najlepiej użyć tekstu, który na pewno tam jest, np. nazwy sklepu.
        // Naciśnięcie na element potomny wywoła zdarzenie `onPress` na rodzicu (TouchableOpacity).
        const itemContent = screen.getByText(mockExpense.store);
        fireEvent.press(itemContent);

        // Oczekujemy, że funkcja mockOnPress została wywołana dokładnie raz.
        expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not throw an error if onPress is not provided', () => {
        // Renderujemy komponent BEZ propsa `onPress`.
        render(<ExpenseItem expense={mockExpense} />);

        const itemContent = screen.getByText(mockExpense.store);

        // Oczekujemy, że naciśnięcie elementu bez przekazanej funkcji onPress nie spowoduje błędu.
        expect(() => fireEvent.press(itemContent)).not.toThrow();
    });
});