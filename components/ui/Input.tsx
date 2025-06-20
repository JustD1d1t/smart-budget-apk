import { Text, TextInput, TextInputProps, View } from 'react-native';

export default function Input({
    label,
    error,
    ...props
}: TextInputProps & { label?: string; error?: string }) {
    return (
        <View>
            {label && <Text style={{ marginBottom: 4, fontWeight: '500' }}>{label}</Text>}
            <TextInput
                {...props}
                style={{
                    borderWidth: 1,
                    borderColor: error ? '#e74c3c' : '#ccc',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: '#fff',
                }}
            />
            {error && <Text style={{ color: '#e74c3c', marginTop: 4 }}>{error}</Text>}
        </View>
    );
}