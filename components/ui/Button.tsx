// components/ui/Button.tsx
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    variant?: 'neutral' | 'danger' | 'confirm' | 'warning';
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
}

const textColor: Record<NonNullable<ButtonProps['variant']>, string> = {
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
    disabled = false,
}: ButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.base,
                styles[variant],
                style,
                disabled && styles.disabled,
            ]}
        >
            <Text
                style={[
                    { color: textColor[variant] } as TextStyle,
                    styles.text,
                    disabled && styles.textDisabled,
                ]}
            >
                {children}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    neutral: {
        backgroundColor: '#ccc',
    } as ViewStyle,
    danger: {
        backgroundColor: '#e74c3c',
    } as ViewStyle,
    confirm: {
        backgroundColor: '#2ecc71',
    } as ViewStyle,
    warning: {
        backgroundColor: '#f39c12',
    } as ViewStyle,
    disabled: {
        opacity: 0.5,
    } as ViewStyle,
    text: {
        fontWeight: 'bold',
        opacity: 1,
    } as TextStyle,
    textDisabled: {
        opacity: 0.7,
    } as TextStyle,
});
