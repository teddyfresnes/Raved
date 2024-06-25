import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { addConvertedRecording } from '../store';
import Icon from 'react-native-vector-icons/Ionicons';
import LoadingOverlay from '../components/LoadingOverlay';

const SousTab2Screen = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [convertedUri, setConvertedUri] = useState(null);
  const selectedRecording = useSelector(state => state.audio.selectedRecording);
  const serverDetails = useSelector(state => state.audio.serverDetails);
  const dispatch = useDispatch();
  const [originalSound, setOriginalSound] = useState(null);
  const [convertedSound, setConvertedSound] = useState(null);

  const SERVER_URL = `http://${serverDetails.ip}:${serverDetails.port}`;

  // import des modèles
  useEffect(() => {
    if (serverDetails.ip && serverDetails.port) {
      axios.get(`${SERVER_URL}/getmodels`)
        .then(response => {
          if (response.data.models) {
            setModels(response.data.models);
          } else {
            Alert.alert('Erreur', 'Aucun modèles trouvés :(');
          }
          setLoading(false);
        })
        .catch(error => {
          console.error(error);
          Alert.alert('Erreur', "Pas possible d'accéder aux modèles");
          setLoading(false);
        });
    }
  }, [serverDetails]);

  // selection modèle
  const handleModelSelection = (model) => {
    setSelectedModel(model);
    axios.get(`${SERVER_URL}/selectModel/${model}`)
      .then(response => {
        //Alert.alert('Modèle selectionné', response.data);
      })
      .catch(error => {
        console.error(error);
        Alert.alert('Erreur', 'Impossible de choisir le modèle');
      });
  };

  // transfert audio
  const transferAudio = async () => {
    if (!selectedModel || !selectedRecording) {
      Alert.alert('Erreur', 'Veuillez choisir un modèle et un audio enregistré dans la tab AUDIO ENTRÉE');
      return;
    }

    setIsTransferring(true);

    const formData = new FormData();
    const fileUri = selectedRecording.uri;
    const originalFileName = fileUri.split('/').pop();
    const modelFileName = selectedModel.replace(/\s+/g, '_');

    formData.append('file', {
      uri: fileUri,
      name: originalFileName,
      type: 'audio/wav',
    });

    try {
      await axios.post(`${SERVER_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Filename': originalFileName,
        },
      });

      const downloadResponse = await axios.get(`${SERVER_URL}/download`, { responseType: 'blob' });
      const reader = new FileReader();
      reader.readAsDataURL(downloadResponse.data);
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        const path = `${FileSystem.documentDirectory}${originalFileName.split('.')[0]}_${modelFileName}.wav`;
        await FileSystem.writeAsStringAsync(path, base64Data, { encoding: FileSystem.EncodingType.Base64 });
        setConvertedUri(path);
        //Alert.alert('Audio converti', 'Audio transferé et converti avec succès !! o:');
      };
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de transférer l\'audio!!');
    } finally {
      setIsTransferring(false);
    }
  };

  // sauvegarde de l'audio dans le store
  const saveConvertedAudio = () => {
    if (convertedUri) {
      const fileName = convertedUri.split('/').pop();
      dispatch(addConvertedRecording({ uri: convertedUri, name: fileName }));
      Alert.alert('Sauvegarde audio', 'Audio converti sauvegardé avec succès !');
    } else {
      Alert.alert('Erreur', 'Aucun audio à sauvegarder...');
    }
  };

  // joue les aperçus
  const playSound = async (uri, setSound) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    setSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    return () => {
      if (originalSound) {
        originalSound.unloadAsync();
      }
      if (convertedSound) {
        convertedSound.unloadAsync();
      }
    };
  }, [originalSound, convertedSound]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sélectionner un modèle :</Text>
      {models.map((model) => (
        <TouchableOpacity
          key={model}
          style={styles.radioContainer}
          onPress={() => handleModelSelection(model)}
        >
          <View style={styles.radioCircle}>
            {selectedModel === model && <View style={styles.selectedRb} />}
          </View>
          <Text style={styles.radioText}>{model}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.button, isTransferring && styles.disabledButton]}
        onPress={transferAudio}
        disabled={isTransferring}
      >
        <Text style={styles.buttonText}>{isTransferring ? "Transfert au serveur..." : "Transférer l'audio"}</Text>
      </TouchableOpacity>

      {isTransferring && <LoadingOverlay />}

      {!isTransferring && convertedUri && (
        <View>
          <View style={styles.audioContainer}>
            <Text>Audio d'origine:</Text>
            <TouchableOpacity onPress={() => playSound(selectedRecording.uri, setOriginalSound)}>
              <Icon name="play-circle-outline" size={30} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.audioContainer}>
            <Text>Audio de sortie:</Text>
            <TouchableOpacity onPress={() => playSound(convertedUri, setConvertedSound)}>
              <Icon name="play-circle-outline" size={30} color="#000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={saveConvertedAudio}>
            <Text style={styles.buttonText}>💾 Sauvegarder 💾</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
  radioText: {
    marginLeft: 10,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#555',
  },
});

export default SousTab2Screen;
