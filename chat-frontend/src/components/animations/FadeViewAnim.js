import React, { useEffect, useState } from 'react';
import { Animated } from 'react-native';

const FadeViewAnim = props => {
  const [fadeAnim] = useState(new Animated.Value(0));

   useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 1800,
        delay: 300
      }
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        ...props.style,
        opacity: fadeAnim
      }}
    >
      {props.children}
    </Animated.View>
  );
};

export default FadeViewAnim;