// components/ui/MemberList.tsx
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Member, useFriendsStore } from '../../stores/friendsStore';
import Accordion from './Accordion';

interface Props {
    members: Member[];              // aktualnie wybrani współtwórcy
    isOwner: boolean;               // możliwość dodawania/usuwania
    onInvite: (id: string) => void; // dodaj do współtwórców (callback)
    onRemove: (id: string) => void; // usuń z współtwórców (callback)
}

export default function MemberList({ members, isOwner, onInvite, onRemove }: Props) {
    const { friends, fetchFriends } = useFriendsStore();
    const [expanded, setExpanded] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        fetchFriends();
        // zainicjalizuj lokalny stan z przekazanych members
        setSelectedIds(members.map(m => m.id));
    }, []);

    // synchronizuj stan, jeśli prop members się zmienią
    useEffect(() => {
        setSelectedIds(members.map(m => m.id));
    }, [members]);

    const handleToggle = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(x => x !== id));
            onRemove(id);
        } else {
            setSelectedIds(prev => [...prev, id]);
            onInvite(id);
        }
    };

    const title = `Współtwórcy (${members.length})`;

    return (
        <Accordion title={title} expanded={expanded} onToggle={() => setExpanded(prev => !prev)}>
            <View style={styles.container}>
                {friends.length === 0 ? (
                    <Text style={styles.empty}>Brak znajomych</Text>
                ) : (
                    <FlatList
                        data={friends}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => {
                            const selected = selectedIds.includes(item.id);
                            return (
                                <View style={styles.memberRow}>
                                    <Text style={styles.email}>{item.user_email}</Text>
                                    {isOwner && (
                                        <TouchableOpacity
                                            onPress={() => handleToggle(item.id)}
                                            style={[styles.btn, selected ? styles.removeBtn : styles.addBtn]}
                                        >
                                            <Text style={selected ? styles.removeText : styles.addText}>
                                                {selected ? 'Usuń' : 'Dodaj'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        }}
                    />
                )}
            </View>
        </Accordion>
    );
}

const styles = StyleSheet.create({
    container: { paddingVertical: 8 },
    memberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    email: { fontSize: 16 },
    btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
    addBtn: { backgroundColor: '#10b981' },
    removeBtn: { backgroundColor: '#ef4444' },
    addText: { color: '#fff' },
    removeText: { color: '#fff' },
    empty: {
        fontStyle: 'italic',
        color: '#888',
        textAlign: 'center',
        marginVertical: 12,
    },
});
