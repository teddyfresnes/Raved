import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';

const Tab2Screen = ({ navigation }) => {
  const [showButtons, setShowButtons] = useState(true);

  const handleNavigation = (screen) => {
    setShowButtons(false);
    navigation.navigate('SousTabs', { screen });
  };

  // ne s'affiche pas car on a le menu des sous tabs finalement...
  return (
    <View style={styles.container}>
      {showButtons && (
        <>
          <View style={styles.buttonContainer}>
            <Button title="Sous Tab 1" onPress={() => handleNavigation('SousTab1')} />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Sous Tab 2" onPress={() => handleNavigation('SousTab2')} />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Sous Tab 3" onPress={() => handleNavigation('SousTab3')} />
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
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});

export default Tab2Screen;
