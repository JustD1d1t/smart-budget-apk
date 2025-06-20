import { Text, TextInput, TextInputProps, View } from 'react-native';

export default function Textarea({
    label,
    error,
    ...props
}: TextInputProps & { label?: string; error?: string }) {
    return (
        <View style={{ marginBottom: 12 }}>
            {label && <Text style={{ marginBottom: 4, fontWeight: '500' }}>{label}</Text>}
            <TextInput
                {...props}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{
                    borderWidth: 1,
                    borderColor: error ? '#e74c3c' : '#ccc',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: '#fff',
                    height: 100,
                }}
            />
            {error && <Text style={{ color: '#e74c3c', marginTop: 4 }}>{error}</Text>}
        </View>
    );
}
