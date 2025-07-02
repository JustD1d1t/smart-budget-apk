import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import ListItem from '../../../components/shopping-list/ListItem';

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

describe('ListItem', () => {
    const list = { id: 'abc123', name: 'Groceries' };
    const pushMock = jest.fn();

    beforeEach(() => {
        // Set return value of useRouter
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    });

    afterEach(() => {
        pushMock.mockClear();
    });

    it('renders the list name', () => {
        const { getByText } = render(<ListItem list={list} />);
        expect(getByText('Groceries')).toBeTruthy();
    });

    it('navigates to detail page on press', () => {
        const { getByText } = render(<ListItem list={list} />);
        fireEvent.press(getByText('Groceries'));
        expect(pushMock).toHaveBeenCalledWith(`/shopping-lists/${list.id}`);
    });
});
