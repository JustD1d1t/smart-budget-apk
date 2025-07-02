// components/ui/__tests__/Card.test.tsx

import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import Card from '../../../components/ui/Card';

describe('Card Component', () => {
    it('renders its children', () => {
        const { getByText } = render(
            <Card testID="card-root">
                <Text>Inner Content</Text>
            </Card>
        );
        expect(getByText('Inner Content')).toBeTruthy();
    });

    it('applies default container styles', () => {
        const { getByTestId } = render(
            <Card testID="card-root" />
        );
        const card = getByTestId('card-root');
        // check a few key defaults
        expect(card).toHaveStyle({
            backgroundColor: '#fff',
            padding: 16,
            borderRadius: 12,
            elevation: 3,
        });
        // shadow styles on iOS also present in style prop
        expect(card.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                }),
            ])
        );
    });

    it('merges custom style prop on top of defaults', () => {
        const custom = { margin: 20, backgroundColor: '#000' };
        const { getByTestId } = render(
            <Card testID="card-root" style={custom} />
        );
        const card = getByTestId('card-root');
        // custom margin should be applied
        expect(card).toHaveStyle({ margin: 20 });
        // custom backgroundColor should override default
        expect(card).toHaveStyle({ backgroundColor: '#000' });
    });

    it('forwards arbitrary ViewProps (e.g., accessibilityLabel)', () => {
        const { getByTestId } = render(
            <Card
                testID="card-root"
                accessibilityLabel="my-card"
                pointerEvents="none"
            />
        );
        const card = getByTestId('card-root');
        expect(card.props.accessibilityLabel).toBe('my-card');
        expect(card.props.pointerEvents).toBe('none');
    });
});
