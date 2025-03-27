import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import commonStyles from '../styles/commonStyles';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userVerified, setUserVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserVerified(userData.isVerified || false);
          }
        } catch (error) {
          console.error("Error checking user status:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [user]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const UserMenu = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showUserMenu}
      onRequestClose={() => setShowUserMenu(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowUserMenu(false)}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowUserMenu(false);
              navigation.navigate('Profile');
            }}
          >
            <Text style={styles.menuText}>Mon Profil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowUserMenu(false);
              navigation.navigate('MyListings');
            }}
          >
            <Text style={styles.menuText}>Mes Annonces</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowUserMenu(false);
              navigation.navigate('Favorites');
            }}
          >
            <Text style={styles.menuText}>Mes Favoris</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemLogout]}
            onPress={handleLogout}
          >
            <Text style={styles.menuTextLogout}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.container}>
        <View style={commonStyles.header}>
          <Image
            source={require('../../assets/LogoApp.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          {user && (
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setShowUserMenu(true)}
            >
              <Image
                source={
                  user.photoURL
                    ? { uri: user.photoURL }
                    : require('../../assets/default-avatar.png')
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.welcome}>Bienvenue sur ColocationApp</Text>
          <Text style={styles.subtitle}>
            {user
              ? `Connecté en tant que ${user.email}`
              : 'Trouvez votre colocation idéale'}
          </Text>

          {!user ? (
            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.buttonText}>Se connecter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.registerButton]}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={[styles.buttonText, styles.registerButtonText]}>
                  S'inscrire
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {user && !loading ? (
            <View style={styles.mainButtonsContainer}>
              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => navigation.navigate('Listings')}
              >
                <Text style={styles.mainButtonText}>
                  Trouver des colocataires
                </Text>
              </TouchableOpacity>
              
              {userVerified ? (
                <TouchableOpacity
                  style={[styles.mainButton, styles.createListingButton]}
                  onPress={() => navigation.navigate('CreateListing')}
                >
                  <Text style={styles.mainButtonText}>
                    Publier une annonce
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.verificationContainer}>
                  <Text style={styles.verificationText}>
                    En attente de vérification de votre carte étudiante
                  </Text>
                </View>
              )}
            </View>
          ) : loading ? (
            <ActivityIndicator size="small" color="#4C86F9" style={styles.loader} />
          ) : null}

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Nos Services</Text>

            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Profils Vérifiés</Text>
                <Text style={styles.featureText}>
                  Tous les colocataires sont des étudiants vérifiés
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Matching Intelligent</Text>
                <Text style={styles.featureText}>
                  Trouvez des colocataires compatibles
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Chat Sécurisé</Text>
                <Text style={styles.featureText}>
                  Communiquez en toute sécurité
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <UserMenu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 40,
  },
  content: {
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4C86F9',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4C86F9',
  },
  registerButtonText: {
    color: '#4C86F9',
  },
  mainButtonsContainer: {
    marginBottom: 30,
  },
  mainButton: {
    backgroundColor: '#4C86F9',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  createListingButton: {
    backgroundColor: '#28a745',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verificationContainer: {
    backgroundColor: '#ffeeba',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
    marginVertical: 10,
  },
  verificationText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'column',
  },
  featureCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  menuItemLogout: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  menuTextLogout: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4C86F9',
  },
  loader: {
    marginVertical: 20,
  }
});