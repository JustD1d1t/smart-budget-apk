import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../stores/userStore";

export default function Login() {
    const router = useRouter();
    const { setUser } = useUserStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [resetEmail, setResetEmail] = useState("");
    const [resetVisible, setResetVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const showToast = (message: string, type: "success" | "danger" = "danger") => {
        showMessage({
            message,
            type,
            duration: 3000,
            icon: type,
        });
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            setLoading(false);

            if (error) {
                let msg = "Wystąpił błąd logowania";
                if (error.message?.includes("Invalid login credentials")) {
                    msg = "Nieprawidłowy email lub hasło";
                } else if (error.message?.includes("Email not confirmed")) {
                    msg = "Email nie został potwierdzony";
                }
                showToast(msg);
            } else {
                setUser(data.user, data.session);
                router.replace("/");
            }
        } catch (err) {
            setLoading(false);
            showToast("Wystąpił błąd logowania");
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
                showToast("Błąd resetu hasła");
            } else {
                showToast("Link do resetu wysłany!", "success");
                setResetVisible(false);
                setResetEmail("");
            }
        } catch {
            setLoading(false);
            showToast("Wystąpił błąd przy resetowaniu hasła");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Logowanie</Text>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Hasło"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Zaloguj się</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setResetVisible((prev) => !prev)}>
                <Text style={styles.link}>Nie pamiętasz hasła?</Text>
            </TouchableOpacity>

            {resetVisible && (
                <View style={styles.resetBox}>
                    <TextInput
                        placeholder="Email do resetu"
                        value={resetEmail}
                        onChangeText={setResetEmail}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Wyślij link resetujący</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.link}>Nie masz konta? Zarejestruj się</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    button: {
        backgroundColor: "#3b82f6",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    buttonText: { color: "#fff", fontWeight: "bold" },
    link: { color: "#3b82f6", textAlign: "center", marginTop: 10 },
    resetBox: { marginTop: 10 },
});
