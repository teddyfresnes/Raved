import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Audio } from 'expo-av';
import { deleteConvertedRecording } from '../store';
import Icon from 'react-native-vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';

const SousTab3Screen = () => {
  const convertedRecordings = useSelector(state => state.audio.convertedRecordings || []);
  const dispatch = useDispatch();

  // écouter
  const playSound = async (uri) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  // supprimer
  const deleteRecording = (uri) => {
    dispatch(deleteConvertedRecording(uri));
    Alert.alert('Succès', 'Enregistrement supprimé avec succès');
  };

  // téléchagement
  const downloadRecordingHandler = async (uri) => {
    try {
      const fileName = uri.split('/').pop();
      let newUri;

      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          Alert.alert('Permission Requise', 'La permission de stockage est requise pour télécharger des fichiers.');
          return;
        }

        const directoryUri = permissions.directoryUri;
        const existingFiles = await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri);

        if (existingFiles.includes(directoryUri + '/' + fileName)) {
          Alert.alert('Erreur de Téléchargement', 'Un fichier existe déjà avec le même nom dans le dossier sélectionné');
          return;
        }

        const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, fileName, 'audio/wav');
        const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        await FileSystem.writeAsStringAsync(destinationUri, fileContent, { encoding: FileSystem.EncodingType.Base64 });
        Alert.alert('Téléchargement Complet', 'Le fichier a été téléchargé dans le dossier sélectionné !!!');
        newUri = destinationUri;
      } else if (Platform.OS === 'ios') {
        const downloadDirectory = FileSystem.documentDirectory + 'downloads/';
        await FileSystem.makeDirectoryAsync(downloadDirectory, { intermediates: true });

        const existingFiles = await FileSystem.readDirectoryAsync(downloadDirectory);
        if (existingFiles.includes(fileName)) {
          Alert.alert('Erreur de Téléchargement', 'Un fichier portant le même nom existe déjà dans le répertoire de téléchargement');
          return;
        }

        newUri = downloadDirectory + fileName;
        await FileSystem.copyAsync({
          from: uri,
          to: newUri,
        });

        Alert.alert('Téléchargement Complet', 'Le fichier a été téléchargé dans le répertoire de documents de l\'application');
      }

      console.log('Nouvelle URI :', newUri);
    } catch (error) {
      console.error('Erreur de téléchargement de l\'enregistrement', error);
      Alert.alert('Erreur de Téléchargement', `Impossible de télécharger l'enregistrement : ${error.message}`);
    }
  };

  // affichage
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Audios Convertis :</Text>
      {convertedRecordings.length === 0 ? (
        <Text style={styles.noRecordingsText}>Il n'y a actuellement aucun audios convertis</Text>
      ) : (
        convertedRecordings.map((recording, index) => (
          <View key={index} style={styles.audioItem}>
            <Text style={styles.itemText}>{recording.name}</Text>
            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={() => playSound(recording.uri)} style={styles.iconButton}>
                <Icon name="play-circle" size={30} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => downloadRecordingHandler(recording.uri)} style={styles.iconButton}>
                <Icon name="arrow-down" size={30} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteRecording(recording.uri)} style={styles.iconButton}>
                <Icon name="trash" size={30} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000',
  },
  noRecordingsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 10,
  },
});

export default SousTab3Screen;
