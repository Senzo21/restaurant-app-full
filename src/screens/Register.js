import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export default function Register({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    contact: '',
    address: '',
    card: ''
  });

  const handleRegister = async () => {
    const { name, surname, email, password, contact, address, card } = form;

    if (!name || !surname || !email || !password || !contact || !address || !card) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        name,
        surname,
        email,
        contact,
        address,
        card
      });

      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('Login');
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
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
          onChangeText={(t) => setForm({ ...form, name: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Surname"
          placeholderTextColor="#aaa"
          value={form.surname}
          onChangeText={(t) => setForm({ ...form, surname: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={form.password}
          onChangeText={(t) => setForm({ ...form, password: t })}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          placeholderTextColor="#aaa"
          value={form.contact}
          onChangeText={(t) => setForm({ ...form, contact: t })}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor="#aaa"
          value={form.address}
          onChangeText={(t) => setForm({ ...form, address: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Card Details (Use test cards)"
          placeholderTextColor="#aaa"
          value={form.card}
          onChangeText={(t) => setForm({ ...form, card: t })}
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
    justifyContent: 'center'
  },
  title: { fontSize: 32, color: '#ffae42', fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    backgroundColor: '#132f4c',
    color: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12
  },
  btn: {
    backgroundColor: '#ffae42',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    alignItems: 'center'
  },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  loginLink: { color: '#fff', marginTop: 12, textAlign: 'center' }
});
