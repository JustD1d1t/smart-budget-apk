// app/register.tsx
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setError('');
        if (!email || !password || !confirmPassword) {
            setError('Wypełnij wszystkie pola.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Hasła muszą być takie same.');
            return;
        }
        // TODO: add register logic
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Text style={styles.title}>Załóż konto</Text>
                <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={!email && error ? 'Wymagany email' : ''}
                />
                <Input
                    label="Hasło"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    error={!password && error ? 'Wymagane hasło' : ''}
                />
                <Input
                    label="Powtórz hasło"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    error={!confirmPassword && error ? 'Powtórz hasło' : ''}
                />
                {error && <Text style={styles.error}>{error}</Text>}
                <Button onPress={handleRegister} variant="confirm">
                    Zarejestruj się
                </Button>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 16,
    },
    card: {
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    error: {
        color: '#e74c3c',
        marginBottom: 12,
    },
});
