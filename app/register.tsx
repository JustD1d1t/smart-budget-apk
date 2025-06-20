import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function Register() {
    const router = useRouter();
    const { user } = useUserStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const showToast = (message: string, type: "success" | "danger" = "danger") => {
        showMessage({
            message,
            type,
            duration: 3000,
            icon: type,
        });
    };

    useEffect(() => {
        if (user) {
            router.replace("/");
        }
    }, [user]);

    const handleRegister = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signUp({ email, password });
            setLoading(false);

            if (error) {
                let msg = "Wystąpił błąd rejestracji";
                if (error.message.includes("invalid email")) {
                    msg = "Nieprawidłowy adres email";
                } else if (error.message.includes("Password should be at least")) {
                    msg = "Hasło musi mieć co najmniej 6 znaków";
                } else if (error.message.includes("User already registered")) {
                    msg = "Użytkownik już istnieje";
                }
                showToast(msg);
            } else {
                showToast("Rejestracja zakończona. Sprawdź email.", "success");
                setTimeout(() => router.replace("/login"), 1500);
            }
        } catch {
            setLoading(false);
            showToast("Wystąpił błąd rejestracji");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Rejestracja</Text>

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

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Zarejestruj się</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={styles.link}>Masz już konto? Zaloguj się</Text>
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
        backgroundColor: "#10b981",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    buttonText: { color: "#fff", fontWeight: "bold" },
    link: { color: "#10b981", textAlign: "center", marginTop: 10 },
});
