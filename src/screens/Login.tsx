import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import type { ScreenProps } from '../types';

export default function Login({ navigation }: ScreenProps<'Login'>): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to login.';
      Alert.alert('Login Failed', message);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0b1e34',
    padding: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 32, color: '#ffae42', fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    backgroundColor: '#132f4c',
    color: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#ffae42',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  registerLink: { color: '#fff', marginTop: 12, textAlign: 'center' },
});
