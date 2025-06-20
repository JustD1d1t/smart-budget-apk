import { Text, TouchableOpacity, ViewStyle } from 'react-native';

export default function Button({
    children,
    onPress,
    variant = 'neutral',
}: {
    children: React.ReactNode;
    onPress: () => void;
    variant?: 'neutral' | 'danger' | 'confirm' | 'warning';
}) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.base, styles[variant]]}>
            <Text style={{ color: textColor[variant], fontWeight: 'bold' }}>{children}</Text>
        </TouchableOpacity>
    );
}

const styles: Record<string, ViewStyle> = {
    base: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    neutral: { backgroundColor: '#ccc' },
    danger: { backgroundColor: '#e74c3c' },
    confirm: { backgroundColor: '#2ecc71' },
    warning: { backgroundColor: '#f39c12' },
};

const textColor = {
    neutral: '#000',
    danger: '#fff',
    confirm: '#fff',
    warning: '#000',
};