import React, { useEffect, useState } from 'react';
import { Animated } from 'react-native';

const ScaleImageAnim = props => {
  console.log(props);
  const [scaleAnim] = useState(new Animated.Value(0));

   useEffect(() => {
    Animated.spring(
      scaleAnim,
      {
        delay: 400,
        toValue: 1
      }
    ).start();
  }, []);

  return (
    <Animated.Image
      { ...props }
      style={{
        ...props.style,
        transform: [
          { scale: scaleAnim }
        ]
      }}
    >
      {props.children}
    </Animated.Image>
  );
};

export default ScaleImageAnim;