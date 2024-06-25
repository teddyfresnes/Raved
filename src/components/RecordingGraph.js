import React from 'react';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';
import { StyleSheet } from 'react-native';

const RecordingGraph = ({ volumes }) => {
  const createPathData = () => {
    if (volumes.length === 0) return '';
    const height = 290;
    const width = 300;
    const maxVolume = 100;
    const step = width / volumes.length;

    let path = `M 0 ${height}`;
    volumes.forEach((volume, index) => {
      const x = index * step;
      const y = height - (volume / maxVolume) * height;
      path += ` L ${x} ${y}`;
    });
    path += ` L ${width} ${height} Z`;

    return path;
  };

  return (
    <Svg height="300" width="320" style={styles.graph}>
      <SvgText
        x="160"
        y="150"
        fill="gray"
        textAnchor="middle"
        fontSize="24"
        fontFamily="Cursive"
        opacity="0.5"
      >
        R A V E D
      </SvgText>
      <Line x1="0" y1="290" x2="320" y2="290" stroke="gray" strokeWidth="1" />
      {volumes.length > 0 && (
        <Path d={createPathData()} stroke="#ff6347" strokeWidth="2" fill="rgba(255, 99, 71, 0.5)" />
      )}
    </Svg>
  );
};

const styles = StyleSheet.create({
  graph: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});

export default RecordingGraph;
