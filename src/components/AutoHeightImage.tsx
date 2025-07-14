import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
  ImageSourcePropType,
  ImageResizeMode,
  LayoutChangeEvent,
  ImageURISource,
} from 'react-native';

interface AutoHeightImageProps {
  src: number | string | ImageURISource;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  // Other Image props can be added here as needed
}

const AutoHeightImage: React.FC<AutoHeightImageProps> = ({
  src,
  style,
  imageStyle,
  resizeMode = 'cover',
  ...rest
}) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Handle image dimension calculation
  useEffect(() => {
    // Only calculate if we have a container width and no fixed height
    if (containerWidth === null) return;

    const getAspectRatio = () => {
      // Handle local image resources
      if (typeof src === 'number') {
        const {width, height} = Image.resolveAssetSource(src);
        setAspectRatio(width / height);
      }
      // Handle remote images
      else if (typeof src === 'string' || src?.uri) {
        const uri = typeof src === 'string' ? src : src.uri;
        if (!uri) return;

        Image.getSize(
          uri,
          (width, height) => setAspectRatio(width / height),
          () => console.warn(`Could not load image from ${uri}`),
        );
      }
    };

    getAspectRatio();
  }, [src, containerWidth]);

  // Handle container layout changes
  const handleLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Calculate image height based on aspect ratio
  const getImageHeight = () => {
    if (!containerWidth || !aspectRatio) return undefined;
    return containerWidth / aspectRatio;
  };

  // Determine image source type
  const getSource = (): ImageSourcePropType => {
    if (typeof src === 'number') return src;
    if (typeof src === 'string') return {uri: src};
    return src;
  };

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {containerWidth && aspectRatio && (
        <Image
          source={getSource()}
          style={[
            styles.image,
            imageStyle,
            {
              width: '100%',
              height: getImageHeight(),
              resizeMode,
            },
          ]}
          {...rest}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignSelf: 'flex-start', // Important for proper width calculation
  },
  image: {
    width: '100%',
  },
});

export default AutoHeightImage;
