// app/login.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Toast from '../components/ui/Toast';
import { supabase } from '../lib/supabaseClient';
import { useUserStore } from '../stores/userStore';

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useUserStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [resetVisible, setResetVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            setLoading(false);

            if (error) {
                let msg = 'Wystąpił błąd logowania';
                if (error.message?.includes('Invalid login credentials')) {
                    msg = 'Nieprawidłowy email lub hasło';
                } else if (error.message?.includes('Email not confirmed')) {
                    msg = 'Email nie został potwierdzony';
                }
                showToast(msg);
            } else {
                setUser(data.user, data.session);
                router.replace('/');
            }
        } catch (err) {
            setLoading(false);
            showToast('Wystąpił błąd logowania');
        }
    };

    const handleReset = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            setLoading(false);

            if (error) {
                showToast('Błąd resetu hasła');
            } else {
                showToast('Link do resetu wysłany!', 'success');
                setResetVisible(false);
                setResetEmail('');
            }
        } catch {
            setLoading(false);
            showToast('Wystąpił błąd przy resetowaniu hasła');
        }
    };

    return (
        <View style={styles.container}>
            {toast && <Toast message={toast.message} type={toast.type} />}
            <Card style={styles.card}>
                <Text style={styles.header}>Logowanie</Text>
                <Input
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Input
                    placeholder="Hasło"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Button onPress={handleLogin} variant="confirm" disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : 'Zaloguj się'}
                </Button>

                <TouchableOpacity onPress={() => setResetVisible((prev) => !prev)}>
                    <Text style={styles.link}>Nie pamiętasz hasła?</Text>
                </TouchableOpacity>

                {resetVisible && (
                    <View style={styles.resetBox}>
                        <Input
                            placeholder="Email do resetu"
                            value={resetEmail}
                            onChangeText={setResetEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Button onPress={handleReset} variant="neutral" disabled={loading}>
                            {loading ? <ActivityIndicator color="#000" /> : 'Wyślij link resetujący'}
                        </Button>
                    </View>
                )}

                <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.link}>Nie masz konta? Zarejestruj się</Text>
                </TouchableOpacity>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    card: { width: '100%', maxWidth: 400, alignSelf: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    link: { color: '#3b82f6', textAlign: 'center', marginTop: 10 },
    resetBox: { marginTop: 10 },
});
