// components/ui/Checkbox.tsx
import { Pressable, Text, View } from 'react-native';

export default function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <Pressable
      testID="checkbox-pressable"
      onPress={() => onChange(!checked)}
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
    >
      <View
        testID="checkbox-box"
        style={{
          width: 20,
          height: 20,
          borderWidth: 1,
          borderColor: '#ccc',
          backgroundColor: checked ? '#2ecc71' : '#fff',
          marginRight: 8,
        }}
      />
      <Text>{label}</Text>
    </Pressable>
  );
}
