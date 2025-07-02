// components/ui/__tests__/ShoppingListSelectModal.test.tsx

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ShoppingListSelectModal from '../../../components/ui/ShoppingListSelectModal';
import { supabase } from '../../../lib/supabaseClient';

// Mock supabase client
jest.mock('../../../lib/supabaseClient', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

describe('ShoppingListSelectModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does not render modal content when isOpen is false', () => {
        const { queryByText } = render(
            <ShoppingListSelectModal
                isOpen={false}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
            />
        );
        expect(queryByText('Wybierz listę zakupową')).toBeNull();
    });

    it('shows loading indicator on open before data loaded', async () => {
        const fromMock = { select: jest.fn() };
        (supabase.from as jest.Mock).mockReturnValue(fromMock);
        fromMock.select.mockReturnValue(Promise.resolve({ data: [], error: null }));

        const { getByText, getByTestId } = render(
            <ShoppingListSelectModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
            />
        );

        expect(getByText('Wybierz listę zakupową')).toBeTruthy();
        expect(getByTestId('shoppinglist-loading')).toBeTruthy();

        await waitFor(() => {
            expect(fromMock.select).toHaveBeenCalledWith('id, name');
        });
    });

    it('shows "Brak dostępnych list." when data empty', async () => {
        const fromMock = { select: jest.fn() };
        (supabase.from as jest.Mock).mockReturnValue(fromMock);
        fromMock.select.mockResolvedValue({ data: [], error: null });

        const { getByText } = render(
            <ShoppingListSelectModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
            />
        );

        await waitFor(() => {
            expect(getByText('Brak dostępnych list.')).toBeTruthy();
        });
    });

    it('renders list buttons and calls onSelect and onClose on press', async () => {
        const lists = [
            { id: '1', name: 'List One' },
            { id: '2', name: 'List Two' },
        ];
        const fromMock = { select: jest.fn() };
        (supabase.from as jest.Mock).mockReturnValue(fromMock);
        fromMock.select.mockResolvedValue({ data: lists, error: null });

        const { getByText } = render(
            <ShoppingListSelectModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
            />
        );

        await waitFor(() => getByText('List One'));
        fireEvent.press(getByText('List Two'));
        expect(mockOnSelect).toHaveBeenCalledWith('2');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when pressing cancel button', async () => {
        const fromMock = { select: jest.fn() };
        (supabase.from as jest.Mock).mockReturnValue(fromMock);
        fromMock.select.mockResolvedValue({ data: [], error: null });

        const { getByText } = render(
            <ShoppingListSelectModal
                isOpen={true}
                onClose={mockOnClose}
                onSelect={mockOnSelect}
            />
        );

        await waitFor(() => getByText('Anuluj'));
        fireEvent.press(getByText('Anuluj'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
