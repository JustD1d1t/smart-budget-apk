import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions } from 'react-native';

export default function Toast({
    message,
    type,
}: {
    message: string;
    type: 'success' | 'error';
}) {
    const translateY = useRef(new Animated.Value(100)).current;
    const { width } = useWindowDimensions();

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    backgroundColor: type === 'success' ? '#2ecc71' : '#e74c3c',
                    transform: [{ translateY }],
                    width: width - 40,
                },
            ]}
        >
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        padding: 12,
        borderRadius: 8,
        zIndex: 1000,
    },
    text: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});