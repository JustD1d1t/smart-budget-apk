// components/ui/Input.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

interface InputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  label?: string;
  error?: string;
  type?: 'text' | 'date' | 'number';
  value: string;
  onChangeText: (text: string) => void;
  maximumDate?: Date;
}

export default function Input({
  label,
  error,
  type = 'text',
  value,
  onChangeText,
  maximumDate,
  secureTextEntry = false,
  ...props
}: InputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const dateValue = value ? new Date(value) : new Date();

  const isNumber = type === 'number';
  const keyboardType =
    type === 'date'
      ? 'default'
      : isNumber
        ? 'decimal-pad'
        : props.keyboardType || 'default';

  // Number input: always enforce two decimal places
  // Number input: enforce decimals only after user types separator
  const handleNumberChange = (text: string) => {
    if (text === '') {
      onChangeText('');
      return;
    }
    // Replace comma with dot and remove invalid chars
    let normalized = text.replace(',', '.').replace(/[^0-9.]/g, '');
    // Ensure single dot
    const parts = normalized.split('.');
    if (parts.length > 2) {
      normalized = parts.shift() + '.' + parts.join('');
    }
    // If user hasn't typed dot yet, just update integer part
    if (!normalized.includes('.')) {
      onChangeText(normalized);
      return;
    }
    // User typed dot: enforce two decimal places
    const [intPart, decPart = ''] = normalized.split('.');
    let finalDec = decPart;
    if (finalDec.length === 0) {
      finalDec = '';
    } else if (finalDec.length === 1) {
      finalDec = decPart + '';
    } else {
      finalDec = decPart.slice(0, 2);
    }
    // Combine: include dot and decimals (even if empty)
    const result = `${intPart}.${finalDec}`;
    onChangeText(result);
  };

  const handleDateChange = (_: any, selected?: Date) => {
    setShowPicker(false);
    if (selected) {
      const iso = selected.toISOString().slice(0, 10);
      onChangeText(iso);
    }
  };

  return (
    <View >
      {label && <Text style={styles.label}>{label}</Text>}

      {type === 'date' ? (
        <>
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={[styles.input, error && styles.inputError]}
          >
            <Text>{value || 'YYYY-MM-DD'}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={maximumDate}
            />
          )}
        </>
      ) : (
        <TextInput
          {...props}
          value={value}
          onChangeText={isNumber ? handleNumberChange : onChangeText}
          secureTextEntry={secureTextEntry}
          textContentType={secureTextEntry ? 'password' : undefined}
          autoComplete={secureTextEntry ? 'password' : undefined}
          autoCorrect={false}
          keyboardType={keyboardType as any}
          style={[styles.input, error && styles.inputError]}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 4, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 20,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: { borderColor: '#dc2626' },
  errorText: { color: '#dc2626', marginTop: 4, fontSize: 12 },
});
