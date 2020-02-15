import React, { useEffect, useState } from 'react';
import { Animated } from 'react-native';

const TranslateViewAnim = props => {
  const [translateAnim] = useState(new Animated.Value(0));

  if (props.triggerAnim) {
    Animated.spring(
      translateAnim,
      {
        toValue: 85
      }
    ).start();
  } else {
    Animated.spring(
      translateAnim,
      {
        toValue: 0
      }
    ).start();
  }

  return (
    <Animated.View
      { ...props }
      style={{
        ...props.style,
        height: translateAnim
      }}
    >
      {props.children}
    </Animated.View>
  );
};

export default TranslateViewAnim;