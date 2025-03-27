import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Menu({ navigation }) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/default-avatar.png')}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.menuItems}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.menuItemText}>Mon Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyListings')}
        >
          <Text style={styles.menuItemText}>Mes Annonces</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.menuItemText}>Mes Favoris</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.menuItemText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Text style={[styles.menuItemText, styles.signOutText]}>
            Se déconnecter
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  menuItems: {
    padding: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  signOutButton: {
    marginTop: 20,
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#ff4444',
  },
}); 