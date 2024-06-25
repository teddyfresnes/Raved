import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import wait from '../../assets/wait.png';

// https://reactnative.dev/docs/activityindicator

const LoadingOverlay = () => {
  return (
    <View style={styles.overlay}>
      <Text style={styles.transferText}>En attente du serveur</Text>
      <Image source={wait} style={styles.image} />
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferText: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});

export default LoadingOverlay;
