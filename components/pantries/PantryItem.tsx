import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { Pantry } from '../../stores/pantriesStore';

type Props = {
    pantry: Pantry;
    onOpen: (id: string) => void;
};

export default function PantryItem({ pantry, onOpen }: Props) {
    return (
        <TouchableOpacity
            testID={`pantry-item-${pantry.id}`}
            accessibilityRole="button"
            style={styles.container}
            onPress={() => onOpen(pantry.id)}
        >
            <Text style={styles.title}>{pantry.name}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
});
