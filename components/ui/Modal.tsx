// components/ui/Modal.tsx
import { Modal as RNModal, Text, TouchableOpacity, View } from 'react-native';

export default function Modal({
    visible,
    onClose,
    children,
    title,
}: {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}) {
    return (
        <RNModal testID="modal-root" visible={visible} animationType="fade" transparent>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    padding: 20,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                }}
            >
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 16,
                    }}
                >
                    {title && (
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                            {title}
                        </Text>
                    )}
                    {children}
                    <TouchableOpacity testID="modal-close-button" onPress={onClose} style={{ marginTop: 12 }}>
                        <Text style={{ textAlign: 'right', color: '#3498db' }}>Zamknij</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </RNModal>
    );
}
