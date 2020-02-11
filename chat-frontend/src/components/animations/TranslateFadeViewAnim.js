import React, { useEffect, useState } from 'react';
import { Animated } from 'react-native';

const TranslateFadeViewAnim = props => {
  const [translateAnim] = useState(new Animated.Value(150));
  const [fadeAnim] = useState(new Animated.Value(0));

   useEffect(() => {
    Animated.timing(
      translateAnim,
      {
        toValue: 0,
        duration: 600
      }
    ).start();
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 1500
      }
    ).start();
  }, []);

  return (
    <Animated.View
      { ...props }
      style={{
        ...props.style,
        transform: [
          { translateY: translateAnim }
        ],
        opacity: fadeAnim
      }}
    >
      {props.children}
    </Animated.View>
  );
};

export default TranslateFadeViewAnim;