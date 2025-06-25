// components/ui/Select.tsx
import { Picker } from '@react-native-picker/picker';
import { Text, View } from 'react-native';

export default function Select({
    label,
    value,
    options,
    onChange,
    placeholder = 'Wybierz...'
}: {
    label?: string;
    value: string;
    options: string[];
    onChange: (val: string) => void;
    placeholder?: string;
}) {
    return (
        <View style={{ marginBottom: 12 }}>
            {label && <Text style={{ marginBottom: 4, fontWeight: '500' }}>{label}</Text>}
            <View
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    backgroundColor: '#fff',
                }}
            >
                <Picker selectedValue={value} onValueChange={onChange}>
                    <Picker.Item label={placeholder} value="" />
                    {options.map((opt) => (
                        <Picker.Item key={opt} label={opt === '' ? placeholder : opt} value={opt} />
                    ))}
                </Picker>
            </View>
        </View>
    );
}
