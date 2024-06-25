import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ToastAndroid, Image, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setServerDetails } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConnectScreen = ({ navigation }) => {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [previousServers, setPreviousServers] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const dispatch = useDispatch();
  const serverDetails = useSelector(state => state.audio.serverDetails);

  useEffect(() => {
    const fetchPreviousServers = async () => {
      const savedServers = await AsyncStorage.getItem('previousServers');
      if (savedServers) {
        setPreviousServers(JSON.parse(savedServers));
      }
    };
    fetchPreviousServers();
  }, []);

  useEffect(() => {
    if (isConnecting) {
      handleConnectionAttempt(serverDetails.ip, serverDetails.port);
    }
  }, [serverDetails]); // watch for changes in serverDetails

  const handleConnect = async () => {
    setIsConnecting(true);
    dispatch(setServerDetails(ip, port));
  };

  const handleConnectionAttempt = async (ip, port) => {
    const url = `http://${ip}:${port}/`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const newServer = { ip, port };
        const serverExists = previousServers.some(
          server => server.ip === ip && server.port === port
        );

        if (!serverExists) {
          const updatedServers = [newServer, ...previousServers].slice(0, 3); // limit to 3 entries
          await AsyncStorage.setItem('previousServers', JSON.stringify(updatedServers));
          setPreviousServers(updatedServers);
        }

        navigation.navigate('MainTabs');
      } else {
        throw new Error('Failed to connect');
      }
    } catch (error) {
      ToastAndroid.show('Connexion échouée...', ToastAndroid.SHORT);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleQuickConnect = (server) => {
    setIp(server.ip);
    setPort(server.port);
    setIsConnecting(true);
    dispatch(setServerDetails(server.ip, server.port));
  };

  const handleNoServerAccess = () => {
    Alert.alert(
      "Attention",
      "Se connecter sans serveur empêchera tout utilisation des conversions par modèles et peut causer des erreurs. L'application ne pourra pas être utilisée totalement.",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => navigation.navigate('MainTabs')
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/slogan.png')} style={styles.image} />
      <Text style={styles.instructions}>Veuillez vous connecter au serveur Python fournissant des modèles onnx</Text>
      <TextInput
        style={styles.input}
        placeholder="Adresse IP : 192.168.1.56..."
        value={ip}
        onChangeText={setIp}
      />
      <TextInput
        style={styles.input}
        placeholder="Port : 8000..."
        value={port}
        onChangeText={setPort}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleConnect} disabled={isConnecting}>
        <Text style={styles.buttonText}>Connexion au serveur</Text>
      </TouchableOpacity>
      {previousServers.length > 0 && (
        <View style={styles.quickConnectContainer}>
          <Text style={styles.quickConnectTitle}>Connexion rapide aux serveurs précédents :</Text>
          {previousServers.slice(0, 3).map((server, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickConnectButton}
              onPress={() => handleQuickConnect(server)}
            >
              <Text style={styles.quickConnectText}>
                {server.ip}:{server.port}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.noServerButton} onPress={handleNoServerAccess}>
        <Text style={styles.noServerButtonText}>Accès sans serveur</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 0,
    marginTop: -75,
  },
  instructions: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickConnectContainer: {
    marginTop: 20,
  },
  quickConnectTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  quickConnectButton: {
    backgroundColor: '#ddd',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 5,
    alignItems: 'center',
  },
  quickConnectText: {
    color: '#333',
    fontSize: 14,
  },
  noServerButton: {
    backgroundColor: '#888',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  noServerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ConnectScreen;
