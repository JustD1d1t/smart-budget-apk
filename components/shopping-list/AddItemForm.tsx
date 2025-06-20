import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { productsDb } from '../../data/productsDb';
import { supabase } from '../../lib/supabaseClient';
import { flattenProductsDb } from '../../utils/flattenProductsDb';
import Accordion from '../ui/Accordion';
import Input from '../ui/Input';
import Select from '../ui/Select';
import ProductAutocomplete from './ProductAutocomplete';

interface Props {
  listId: string;
  onItemAdded?: (item: any) => void;
}

const AddItemForm = ({ listId, onItemAdded }: Props) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('szt');
  const [errors, setErrors] = useState<{ name?: string; quantity?: string }>({});

  const flatProducts = flattenProductsDb(productsDb);

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Podaj nazwę produktu.';
    if (!quantity.trim()) newErrors.quantity = 'Podaj ilość.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const matchedProduct = flatProducts.find(
      (product) => product.name.toLowerCase() === name.toLowerCase()
    );
    const category = matchedProduct?.category ?? 'inne';

    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .insert({
          list_id: listId,
          name,
          category,
          quantity: Number(quantity),
          unit,
          bought: false,
        })
        .select()
        .single();

      if (error) throw error;

      setName('');
      setQuantity('');
      setUnit('szt');
      onItemAdded?.(data);
    } catch (err) {
      console.error('Błąd przy dodawaniu produktu:', err);
      Alert.alert('Błąd', 'Nie udało się dodać produktu.');
    }
  };

  return (
    <Accordion title="Dodaj nowy produkt">
      <View style={styles.container}>
        <ProductAutocomplete
          productsDb={flatProducts}
          value={name}
          onChange={setName}
          onClick={setName}
          error={errors.name}
        />

        <Input
          label="Ilość"
          placeholder="np. 2"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
          error={errors.quantity}
        />

        <Select
          label="Jednostka"
          value={unit}
          options={['szt', 'kg', 'g', 'l', 'ml']}
          onChange={setUnit}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Dodaj produkt</Text>
        </TouchableOpacity>
      </View>
    </Accordion>
  );
};

export default AddItemForm;

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  button: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
