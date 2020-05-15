import React, { useEffect, useState } from 'react';
import { Animated } from 'react-native';

const ScaleViewTriggerAnim = props => {
  const [scaleAnim] = useState(new Animated.Value(0.01));

  if (props.triggerPinAnim) {
    Animated.spring(
      scaleAnim,
      {
        toValue: 1,
        delay: 500
      }
    ).start();
  } else {
    Animated.spring(
      scaleAnim,
      {
        toValue: 0.01
      }
    ).start();
  }

  return (
    <Animated.View
      { ...props }
      style={{
        ...props.style,
        transform: [
          { scale: scaleAnim }
        ]
      }}
    >
      {props.children}
    </Animated.View>
  );
};

export default ScaleViewTriggerAnim;