import { fireEvent, render, screen } from '@testing-library/react-native';
import PantryItem from '../../../components/pantries/PantryItem';

describe('PantryItem', () => {
    const mockOnOpen = jest.fn();
    const pantry = { id: 'p1', name: 'Moja spiżarnia' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders pantry name', () => {
        render(<PantryItem pantry={pantry} onOpen={mockOnOpen} />);
        expect(screen.getByText('Moja spiżarnia')).toBeTruthy();
    });

    it('calls onOpen with pantry id when pressed', () => {
        render(<PantryItem pantry={pantry} onOpen={mockOnOpen} />);
        const touchable = screen.getByTestId('pantry-item-p1');
        fireEvent.press(touchable);
        expect(mockOnOpen).toHaveBeenCalledWith('p1');
    });

    it('has correct touchable accessibility role and testID', () => {
        render(<PantryItem pantry={pantry} onOpen={mockOnOpen} />);
        const touchable = screen.getByTestId('pantry-item-p1');
        expect(touchable.props.accessibilityRole).toBe('button');
        expect(touchable.props.testID).toBe('pantry-item-p1');
    });
});
