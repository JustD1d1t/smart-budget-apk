// components/ui/Input.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  type?: 'text' | 'date';
  maximumDate?: Date;
}

export default function Input({
  label,
  error,
  type = 'text',
  value,
  onChangeText,
  maximumDate,
  secureTextEntry = false,              // 1. wyciągamy prop
  ...props
}: InputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const dateValue =
    typeof value === 'string' && value ? new Date(value) : new Date();

  const handleDateChange = (_: any, selected?: Date) => {
    setShowPicker(false);
    if (selected && onChangeText) {
      const iso = selected.toISOString().slice(0, 10);
      onChangeText(iso);
    }
  };

  return (
    <View style={styles.wrapper}>
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
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}         // 2. explicite
          textContentType={secureTextEntry ? 'password' : undefined}  // 3. ułatwia systemowi
          autoComplete={secureTextEntry ? 'password' : undefined}
          autoCorrect={false}
          style={[styles.input, error && styles.inputError]}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 8 },        // 4. brakowało wrappera
  label: { marginBottom: 4, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    color: '#000',                       // 5. upewniamy się, że tekst jest czarny
  },
  inputError: { borderColor: '#dc2626' },
  errorText: { color: '#dc2626', marginTop: 4, fontSize: 12 },
});
