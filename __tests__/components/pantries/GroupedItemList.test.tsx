import { fireEvent, render, screen } from '@testing-library/react-native';
import GroupedItemList, { Item } from '../../../components/pantries/GroupedItemList';

describe('GroupedItemList', () => {
    const items: Item[] = [
        { id: '1', name: 'Mleko', category: 'Nabiał', quantity: 2, unit: 'szt' },
        { id: '2', name: 'Jogurt', category: 'Nabiał', quantity: 1, unit: 'szt' },
        { id: '3', name: 'Chleb', category: 'Pieczywo', quantity: 3, unit: 'szt' },
    ];
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders category headers with counts', () => {
        render(<GroupedItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
        expect(screen.getByText('Nabiał (2)')).toBeTruthy();
        expect(screen.getByText('Pieczywo (1)')).toBeTruthy();
    });

    it('does not show items before category is expanded', () => {
        render(<GroupedItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
        expect(screen.queryByText('Mleko')).toBeNull();
        expect(screen.queryByText('Chleb')).toBeNull();
    });

    it('expands and collapses category when header is pressed', () => {
        render(<GroupedItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
        const header = screen.getByText('Nabiał (2)');
        // expand
        fireEvent.press(header);
        expect(screen.getByText('Mleko')).toBeTruthy();
        expect(screen.getByText('Jogurt')).toBeTruthy();
        // collapse
        fireEvent.press(header);
        expect(screen.queryByText('Mleko')).toBeNull();
        expect(screen.queryByText('Jogurt')).toBeNull();
    });

    it('calls onEdit when edit icon is pressed', () => {
        render(<GroupedItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
        fireEvent.press(screen.getByText('Nabiał (2)'));
        fireEvent.press(screen.getAllByText('✏️')[0]);
        expect(mockOnEdit).toHaveBeenCalledWith(items[0]);
    });

    it('calls onDelete when delete icon is pressed', () => {
        render(<GroupedItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
        fireEvent.press(screen.getByText('Pieczywo (1)'));
        fireEvent.press(screen.getAllByText('🗑')[0]);
        expect(mockOnDelete).toHaveBeenCalledWith('3');
    });
});
