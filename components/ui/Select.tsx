import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, View } from 'react-native';

export type SelectOption = {
    label: string;
    value: string;
};

export default function Select({
    label,
    value,
    options,
    onChange,
    placeholder = 'Wybierz...',
    error,
}: {
    label?: string;
    value: string;
    options: SelectOption[];
    onChange: (val: string) => void;
    placeholder?: string;
    error?: string;
}) {
    return (
        <View style={styles.wrapper}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.pickerContainer, error && styles.pickerError]}>
                <Picker selectedValue={value} onValueChange={(val) => onChange(val)}>
                    <Picker.Item label={placeholder} value="" />
                    {options.map((opt) => (
                        <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                    ))}
                </Picker>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        marginBottom: 4,
        fontWeight: '500',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    pickerError: {
        borderColor: '#dc2626',
    },
    errorText: {
        color: '#dc2626',
        marginTop: 4,
        fontSize: 12,
    },
});