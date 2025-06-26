import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFriendsStore } from '../../stores/friendsStore';
import Button from './Button';

export interface Member {
    id: string;
    email: string;
}

interface Props {
    isOwner: boolean;
    members: Member[];
    onAddFriend?: (friendEmail: string) => void;
    onRemoveFriend?: (friendEmail: string) => void;
}

export default function MemberList({ isOwner, members = [], onAddFriend, onRemoveFriend }: Props) {
    const { friends, fetchFriends } = useFriendsStore();
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    // Przygotuj listę zaakceptowanych znajomych
    const acceptedFriends = friends
        .filter(f => f.status === 'accepted')
        .map(f => ({ id: f.requester_id === f.recipient_id ? f.id : f.id, email: f.user_email }));

    return (
        <View style={styles.content}>
            {/* Sekcja: Znajomi */}
            <Text style={styles.sectionTitle}>Znajomi</Text>
            {acceptedFriends.length > 0 ? (
                <FlatList
                    data={acceptedFriends}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => {
                        return (
                            <View style={styles.memberRow}>
                                <Text style={styles.email}>{item.email}</Text>
                                {onAddFriend && isOwner && (
                                    <Button size="sm" variant="confirm" onPress={() => onAddFriend(item.email)}>
                                        Dodaj
                                    </Button>
                                )}
                            </View>
                        );
                    }}
                />
            ) : (
                <Text style={styles.emptyText}>Brak znajomych</Text>
            )}

            {/* Sekcja: Współtwórcy */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Współtwórcy</Text>
            {members.length > 0 ? (
                <FlatList
                    data={members}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.memberRow}>
                            <Text style={styles.email}>{item.email}</Text>
                            {onRemoveFriend && isOwner && (
                                <Button size="sm" variant="danger" onPress={() => onRemoveFriend(item.email)}>
                                    Usuń
                                </Button>
                            )}
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.emptyText}>Brak współtwórców</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    memberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    email: {
        fontSize: 14,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#888',
    },
});
