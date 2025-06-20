// components/ui/MemberList.tsx

import { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useFriendsStore } from "../../stores/friendsStore";

interface Member {
    id: string;
    email: string;
    role: string;
}

interface Props {
    members: Member[];
    isOwner: boolean;
    onInvite: (email: string) => void;
    onRemove: (id: string) => void;
}

export default function MemberList({ members, isOwner, onInvite, onRemove }: Props) {
    const { friends, fetchFriends } = useFriendsStore();
    const [selectedEmail, setSelectedEmail] = useState("");

    useEffect(() => {
        fetchFriends();
    }, []);

    const acceptedFriends = friends.filter((f) => f.status === "accepted");

    const availableEmails = acceptedFriends
        .map((f) => f.user_email)
        .filter((email) => !members.some((m) => m.email === email));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Współtwórcy</Text>

            {isOwner && (
                <View style={styles.inviteBox}>
                    <Text style={styles.label}>Zaproś znajomego</Text>
                    <FlatList
                        data={availableEmails}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.selectItem}
                                onPress={() => {
                                    onInvite(item);
                                    setSelectedEmail("");
                                }}
                            >
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            <View style={styles.memberList}>
                {members.map((member) => (
                    <View key={member.id} style={styles.memberRow}>
                        <Text>{member.email}</Text>
                        {isOwner && member.role !== "owner" && (
                            <TouchableOpacity onPress={() => onRemove(member.id)}>
                                <Text style={styles.removeText}>Usuń</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    title: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
    inviteBox: { marginBottom: 12 },
    label: { marginBottom: 4 },
    selectItem: {
        padding: 8,
        backgroundColor: "#f3f4f6",
        marginBottom: 4,
        borderRadius: 6,
    },
    memberList: { gap: 8 },
    memberRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        marginBottom: 4,
    },
    removeText: { color: "#ef4444" },
});
