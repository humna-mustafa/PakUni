import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TYPOGRAPHY} from '../../constants/design';

interface ProgressCircleProps {
  progress: number;
  size?: number;
  color: string;
  colors: any;
}

const ProgressCircle = React.memo(
  ({progress, size = 60, color, colors}: ProgressCircleProps) => {
    return (
      <View style={[styles.progressCircle, {width: size, height: size}]}>
        <View
          style={[
            styles.progressCircleInner,
            {
              width: size - 8,
              height: size - 8,
              backgroundColor: colors.card,
            },
          ]}>
          <Text style={[styles.progressCircleText, {color}]}>
            {progress}%
          </Text>
        </View>
        <View
          style={[
            styles.progressCircleBg,
            {
              borderColor: color + '30',
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  progressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleInner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    zIndex: 1,
  },
  progressCircleBg: {
    position: 'absolute',
    borderWidth: 4,
  },
  progressCircleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
});

export default ProgressCircle;
