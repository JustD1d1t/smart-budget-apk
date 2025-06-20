import { View, ViewProps } from 'react-native';

export default function Card({ children, style, ...rest }: ViewProps) {
    return (
        <View
            {...rest}
            style={[{
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 3,
            }, style]}
        >
            {children}
        </View>
    );
}