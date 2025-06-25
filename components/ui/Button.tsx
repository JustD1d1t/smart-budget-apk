// components/ui/Button.tsx
import React from 'react';
import { StyleProp, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    variant?: 'neutral' | 'danger' | 'confirm' | 'warning';
    style?: StyleProp<ViewStyle>;
}

const textColor = {
    neutral: '#000',
    danger: '#fff',
    confirm: '#fff',
    warning: '#000',
};

export default function Button({
    children,
    onPress,
    variant = 'neutral',
    style,
}: ButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.base, styles[variant], style]}
        >
            <Text style={{ color: textColor[variant], fontWeight: 'bold' }}>
                {children}
            </Text>
        </TouchableOpacity>
    );
}

const styles = {
    base: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    neutral: { backgroundColor: '#ccc' },
    danger: { backgroundColor: '#e74c3c' },
    confirm: { backgroundColor: '#2ecc71' },
    warning: { backgroundColor: '#f39c12' },
};
