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
        <View testID="select-container">
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                testID="select-picker-container"
                style={[styles.pickerContainer, error && styles.pickerError]}
            >
                <Picker
                    selectedValue={value}
                    onValueChange={val => onChange(val)}
                    style={styles.picker}
                    dropdownIconColor={error ? '#dc2626' : '#000'}
                >
                    <Picker.Item label={placeholder} value="" color="#888" enabled={false} />
                    {options.map(opt => (
                        <Picker.Item
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                            color="#000"
                        />
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
    picker: {
        color: '#000', // ensure selected value is visible on white background
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
