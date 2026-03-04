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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { ScreenProps } from '../types';

type RegisterForm = {
  name: string;
  surname: string;
  email: string;
  password: string;
  contact: string;
  address: string;
  card: string;
};

const initialForm: RegisterForm = {
  name: '',
  surname: '',
  email: '',
  password: '',
  contact: '',
  address: '',
  card: '',
};

export default function Register({ navigation }: ScreenProps<'Register'>): JSX.Element {
  const [form, setForm] = useState<RegisterForm>(initialForm);

  const handleRegister = async () => {
    const { name, surname, email, password, contact, address, card } = form;

    if (!name || !surname || !email || !password || !contact || !address || !card) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        name,
        surname,
        email: email.trim(),
        contact,
        address,
        card,
        role: email.trim().toLowerCase() === 'admin@example.com' ? 'admin' : 'user',
      });

      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('Login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed.';
      Alert.alert('Registration Failed', message);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#aaa"
          value={form.name}
          onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Surname"
          placeholderTextColor="#aaa"
          value={form.surname}
          onChangeText={(value) => setForm((prev) => ({ ...prev, surname: value }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={form.email}
          onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={form.password}
          onChangeText={(value) => setForm((prev) => ({ ...prev, password: value }))}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          placeholderTextColor="#aaa"
          value={form.contact}
          onChangeText={(value) => setForm((prev) => ({ ...prev, contact: value }))}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor="#aaa"
          value={form.address}
          onChangeText={(value) => setForm((prev) => ({ ...prev, address: value }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Card Details (Use test cards)"
          placeholderTextColor="#aaa"
          value={form.card}
          onChangeText={(value) => setForm((prev) => ({ ...prev, card: value }))}
        />

        <TouchableOpacity style={styles.btn} onPress={handleRegister}>
          <Text style={styles.btnText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Already have an account? Login</Text>
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
  loginLink: { color: '#fff', marginTop: 12, textAlign: 'center' },
});
