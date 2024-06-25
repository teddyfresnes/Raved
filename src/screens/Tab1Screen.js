import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { addRecording } from '../store';
import Icon from 'react-native-vector-icons/FontAwesome';
import RecordingGraph from '../components/RecordingGraph';

const Tab1Screen = () => {
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [title, setTitle] = useState('');
  const [volumes, setVolumes] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(async () => {
        const status = await recording.getStatusAsync();
        if (status.isRecording) {
          const volume = status.metering ? Math.max(0, Math.pow((status.metering + 160) / 160, 2)) : 0;
          setVolumes((prevVolumes) => {
            const newVolumes = [...prevVolumes, volume * 100];
            return newVolumes.slice(-50);
          });
        }
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recording]);

  // enregistrement et permissions si nécessaire
  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();

      console.log('Starting recording..');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // arreter l'enregistrement
  const stopRecording = async () => {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordedUri(uri);
    console.log('Recording stopped and stored at', uri);
  };

  // ecouter l'enregistrement
  const playSound = async () => {
    console.log('Loading sound');
    const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
    setSound(sound);
    console.log('Playing sound');
    await sound.playAsync();
  };

  // supprimer l'enregistrement
  const deleteRecording = async () => {
    if (recordedUri) {
      await FileSystem.deleteAsync(recordedUri);
      setRecordedUri(null);
      setVolumes([]);
      console.log('Recording deleted');
    }
  };

  // sauvegarder l'enregistrement dans le store
  const saveRecording = async () => {
    if (!title.trim()) {
      alert('Entrez un nom pour l\'audio !');
      return;
    }
    const newUri = `${FileSystem.documentDirectory}${title.trim()}.wav`;
    await FileSystem.moveAsync({
      from: recordedUri,
      to: newUri,
    });
    dispatch(addRecording({ title: title.trim(), uri: newUri }));
    setRecordedUri(null);
    setTitle('');
    setVolumes([]);
    console.log('Recording saved to', newUri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>Appuyez sur le micro pour enregistrer</Text>
      <RecordingGraph volumes={volumes} />
      {!recording && !recordedUri && (
        <TouchableOpacity onPress={startRecording} style={styles.iconButton}>
          <Icon name="microphone" size={40} color="red" />
        </TouchableOpacity>
      )}
      {recording && (
        <TouchableOpacity onPress={stopRecording} style={styles.iconButton}>
          <Icon name="stop" size={40} color="#ff6347" />
        </TouchableOpacity>
      )}
      {recordedUri && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nom de l'enregistrement"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={playSound} style={styles.actionButton}>
              <Icon name="play" size={30} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={deleteRecording} style={styles.actionButton}>
              <Icon name="trash" size={30} color="#ff6347" />
            </TouchableOpacity>
            <TouchableOpacity onPress={saveRecording} style={styles.actionButton}>
              <Icon name="save" size={30} color="green" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  instructionText: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginTop: 20,
  },
  iconButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    padding: 10,
  },
});

export default Tab1Screen;
