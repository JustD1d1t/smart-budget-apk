// components/pantries/AddPantryItemForm.tsx
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { productsDb } from '../../data/productsDb';
import { supabase } from '../../lib/supabaseClient';
import { flattenProductsDb } from '../../utils/flattenProductsDb';
import ProductAutocomplete from "../shopping-list/ProductAutocomplete";
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Toast from '../ui/Toast';

const flatProducts = flattenProductsDb(productsDb);

const UNITS = ['szt', 'kg'];

type PantryItem = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    expiry_date?: string | null;
};

interface Props {
    pantryId: string;
    onItemAdded: (item: PantryItem) => void;
}

export default function AddPantryItemForm({ pantryId, onItemAdded }: Props) {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const validate = () => {
        const errs: { [key: string]: string } = {};
        if (!name.trim()) errs.name = 'Nazwa produktu jest wymagana.';
        if (!quantity || Number(quantity) <= 0) errs.quantity = 'Ilość musi być > 0.';
        if (!unit) errs.unit = 'Wybierz jednostkę.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            const product = flatProducts.find(product => product.name === name);
            const { data, error } = await supabase
                .from('pantry_items')
                .insert({
                    pantry_id: pantryId,
                    name: name.trim(),
                    category: product ? product.category : 'inne',
                    quantity: Number(quantity),
                    unit,
                    expiry_date: expiryDate || null,
                })
                .select()
                .single();
            if (error || !data) throw error || new Error('Brak danych');
            onItemAdded(data as PantryItem);
            setName(''); setQuantity('1'); setUnit(''); setExpiryDate('');
            setToast({ message: 'Produkt dodany!', type: 'success' });
        } catch (err: any) {
            setToast({ message: err.message || 'Błąd dodawania produktu.', type: 'error' });
        }
    };

    const handleChange = (val: string) => {
        setName(val);
    }

    return (
        <View style={styles.container}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <ProductAutocomplete
                value={name}
                onChange={(val) => handleChange(val)}
                onClick={(val) => handleChange(val)}
                error={errors.name}
            />
            <View style={styles.row}>
                <Input
                    label="Ilość"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                    error={errors.quantity}
                />
                <Select
                    label="Jednostka"
                    value={unit}
                    options={UNITS.map(u => ({ label: u, value: u }))}
                    onChange={setUnit}
                    placeholder="-- wybierz --"
                    error={errors.unit}
                />
            </View>
            <Input
                label="Data przydatności"
                placeholder="YYYY-MM-DD"
                value={expiryDate}
                onChangeText={setExpiryDate}
            />
            <Button onPress={handleSubmit} variant="confirm" style={styles.button}>
                ➕ Dodaj produkt
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 12, marginVertical: 16 },
    row: { flexDirection: 'row', gap: 12 },
    button: { marginTop: 8 },
});
