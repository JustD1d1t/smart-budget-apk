// components/ui/Accordion.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Accordion({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setOpen(!open)} style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
            </TouchableOpacity>
            {open && <View style={styles.content}>{children}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f2f2f2',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: 12,
    },
});
