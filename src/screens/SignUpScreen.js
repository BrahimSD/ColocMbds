import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile,
  fetchSignInMethodsForEmail 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import commonStyles from '../styles/commonStyles';

export default function SignUpScreen({ navigation }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = async () => {
    let newErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (!formData[key].trim()) {
        newErrors[key] = 'Ce champ est requis';
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.email && !newErrors.email) {
      try {
        const auth = getAuth();
        const signInMethods = await fetchSignInMethodsForEmail(auth, formData.email);
        if (signInMethods.length > 0) {
          newErrors.email = 'Cet email est déjà utilisé';
        }
      } catch (error) {
        console.error('Error checking email:', error);
      }
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!await validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }
  
    setIsLoading(true);
  
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });
  
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        displayName: `${formData.firstName} ${formData.lastName}`,
        status: 'pending',
        isVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
  
      Alert.alert(
        'Succès', 
        'Compte créé avec succès',
        [{ text: 'OK', onPress: () => navigation.replace('Profile') }]
      );
    } catch (error) {
      console.error('SignUp error:', error);
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cet email est déjà utilisé par un autre compte';
          break;
        case 'auth/invalid-email':
          errorMessage = 'L\'adresse email n\'est pas valide';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'La création de compte est temporairement désactivée';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.header}>
        <View style={commonStyles.placeholder} />
        <Text style={commonStyles.headerTitle}>Inscription</Text>
        <View style={commonStyles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Image
            source={require('../../assets/LogoApp.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Créer un compte</Text>

          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="Prénom"
            value={formData.firstName}
            onChangeText={(text) => setFormData({...formData, firstName: text})}
            autoCapitalize="words"
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            placeholder="Nom"
            value={formData.lastName}
            onChangeText={(text) => setFormData({...formData, lastName: text})}
            autoCapitalize="words"
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Mot de passe"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            secureTextEntry
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>
              Déjà un compte ? Se connecter
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  signUpButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4C86F9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 20,
    padding: 10,
  },
  loginButtonText: {
    color: '#4C86F9',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  }
});