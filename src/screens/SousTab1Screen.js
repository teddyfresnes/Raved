import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { deleteRecording, selectRecording, addRecording } from '../store';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';

const SousTab1Screen = ({ navigation }) => {
  const recordings = useSelector(state => state.audio.recordings);
  const selectedRecording = useSelector(state => state.audio.selectedRecording);
  const dispatch = useDispatch();
  const [sound, setSound] = useState(null);
  const [selectedUri, setSelectedUri] = useState(selectedRecording ? selectedRecording.uri : null);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // écouter l'audio
  const playSound = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Erreur de chargement ou de lecture du son', error);
    }
  };

  // supprimer
  const deleteRecordingHandler = async (uri) => {
    try {
      await FileSystem.deleteAsync(uri);
      dispatch(deleteRecording(uri));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enregistrement', error);
    }
  };

  // selectionner dans le store
  const selectRecordingHandler = (uri) => {
    const selected = recordings.find(recording => recording.uri === uri);
    dispatch(selectRecording(selected));
    setSelectedUri(uri);
  };

  // téléchargement de l'audio
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

  // import d'un son, alerte asynchrone
  const uploadAudioHandler = async () => {
    Alert.alert('Téléversement',"Vous pouvez choisir un audio à importer dans Raved, veillez à ce que l'extension soit en wav pour garantir le bon fonctionnement de l'application !",
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true
              });
          
              console.log('DocumentPicker result:', result);
          
              if (result.canceled) {
                console.log('Document picking canceled');
                return;
              }
          
              if (result.assets && result.assets.length > 0) {
                const { uri, name } = result.assets[0];
                console.log('Selected file URI:', uri);
                console.log('Selected file name:', name);
          
                const newUri = `${FileSystem.documentDirectory}${name}`;
                await FileSystem.copyAsync({ from: uri, to: newUri });
          
                dispatch(addRecording({ uri: newUri, title: name }));
                console.log('Audio uploaded', newUri);
                Alert.alert('Téléversement', 'Le fichier a bien été téléversé !');
              } else {
                console.log('No assets found in the result');
                Alert.alert('Téléversement', 'Erreur');
              }
            } catch (error) {
              console.error('Error uploading audio', error);
              Alert.alert('Téléversement', 'Erreur');
            }
          }
        }
      ]
    );
  };

  // affichage
  return (
    <View style={styles.container}>
      {recordings.length === 0 ? (
        <Text style={styles.noRecordingsText}>Il n'y a actuellement aucun audios enregistrés</Text>
      ) : (
        <FlatList
          data={recordings}
          keyExtractor={(item) => item.uri}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.title}</Text>
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => playSound(item.uri)} style={styles.iconButton}>
                  <Icon name="play-circle" size={30} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => downloadRecordingHandler(item.uri)} style={styles.iconButton}>
                  <Icon name="arrow-down" size={30} color="green" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteRecordingHandler(item.uri)} style={styles.iconButton}>
                  <Icon name="trash" size={30} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      <Text style={styles.pickerLabel}>Sélectionnez un audio pour le convertir</Text>
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={uploadAudioHandler} style={styles.uploadButton}>
          <Icon name="cloud-upload" size={30} color="black" />
        </TouchableOpacity>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedUri}
            onValueChange={(itemValue) => selectRecordingHandler(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Sélectionner un audio..." value={null} />
            {recordings.map((recording) => (
              <Picker.Item key={recording.uri} label={recording.title} value={recording.uri} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  noRecordingsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  uploadButton: {
    marginRight: 15,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  pickerLabel: {
    marginBottom: -5,
    fontSize: 16,
    color: '#000',
  },
  picker: {
    color: '#000',
  },
});

export default SousTab1Screen;
