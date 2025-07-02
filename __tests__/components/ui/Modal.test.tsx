import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import Modal from '../../../components/ui/Modal';

describe('Modal Component', () => {
    const onClose = jest.fn();

    it('does not render when visible=false', () => {
        const { queryByTestId } = render(
            <Modal visible={false} onClose={onClose}>
                <Text>Inner</Text>
            </Modal>
        );
        // root modal nie jest w drzewie
        expect(queryByTestId('modal-root')).toBeNull();
    });

    it('renders children and title when visible=true', () => {
        const { getByTestId, getByText, queryByText } = render(
            <Modal visible={true} onClose={onClose} title="My Title">
                <Text>Inner Content</Text>
            </Modal>
        );
        // root
        expect(getByTestId('modal-root')).toBeTruthy();
        // title
        expect(getByText('My Title')).toBeTruthy();
        // children
        expect(getByText('Inner Content')).toBeTruthy();
        // "Zamknij" button
        expect(getByText('Zamknij')).toBeTruthy();
    });

    it('omits title when no title prop passed', () => {
        const { getByTestId, queryByText } = render(
            <Modal visible={true} onClose={onClose}>
                <Text>Content</Text>
            </Modal>
        );
        expect(getByTestId('modal-root')).toBeTruthy();
        // nie ma tytułu
        expect(queryByText('My Title')).toBeNull();
    });

    it('calls onClose when pressing "Zamknij"', () => {
        const { getByTestId } = render(
            <Modal visible={true} onClose={onClose}>
                <Text>Content</Text>
            </Modal>
        );
        fireEvent.press(getByTestId('modal-close-button'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('has correct transparency and animationType props on RNModal', () => {
        const { getByTestId } = render(
            <Modal visible={true} onClose={onClose} />
        );
        const modal = getByTestId('modal-root');
        // sprawdź, że transparent=true i animationType="fade"
        expect(modal.props.transparent).toBe(true);
        expect(modal.props.animationType).toBe('fade');
    });
});
