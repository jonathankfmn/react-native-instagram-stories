import { Image, View } from 'react-native';
import React, { FC, memo, useState } from 'react';
import {
  runOnJS, useAnimatedReaction, useDerivedValue, useSharedValue,
} from 'react-native-reanimated';
import { StoryImageProps } from '../../core/dto/componentsDTO';
import Loader from '../Loader';
import { HEIGHT, LOADER_COLORS, WIDTH } from '../../core/constants';
import ImageStyles from './Image.styles';
import ExpoStoryVideo from "./expo-video";
import NativeStoryVideo from "./video";

const StoryImage: FC<StoryImageProps> = ( {
  stories, activeStory, defaultImage, isDefaultVideo, paused, videoPlayer="react-native-video", videoProps, isActive,
  onImageLayout, onLoad,
} ) => {

  const [ data, setData ] = useState<{ uri: string, isVideo?: boolean }>(
    { uri: defaultImage, isVideo: isDefaultVideo },
  );

  const loading = useSharedValue( true );
  const color = useSharedValue( LOADER_COLORS );
  const videoDuration = useSharedValue<number | undefined>( undefined );
  const isPaused = useDerivedValue( () => paused.value || !isActive.value );

  const onImageChange = async () => {

    const story = stories.find( ( item ) => item.id === activeStory.value )!;

    if ( !story ) {

      return;

    }

    if ( data.uri === story.sourceUrl && ( !data.isVideo || videoDuration.value !== undefined ) ) {

      onLoad( videoDuration.value );

    } else {

      loading.value = true;
      setData( { uri: story.sourceUrl, isVideo: story.mediaType === 'video' } );

    }

    const nextStory = stories[stories.indexOf( story ) + 1];

    if ( nextStory && nextStory.mediaType !== 'video' ) {

      Image.prefetch( nextStory.sourceUrl );

    }

  };

  useAnimatedReaction(
    () => activeStory.value,
    ( res, prev ) => res !== prev && runOnJS( onImageChange )(),
    [ activeStory.value ],
  );

  const onContentLoad = ( duration?: number ) => {

    if ( data.isVideo ) {

      videoDuration.value = duration;

    }

    loading.value = false;
    onLoad( duration );

  };

  return (
    <>
      <View style={ImageStyles.container}>
        <Loader loading={loading} color={color} size={50} />
      </View>
      <View style={ImageStyles.image}>
        {data.uri && (
          data.isVideo ? (
            videoPlayer === "expo" ? (
              <ExpoStoryVideo
                onLoad={onContentLoad}
                onLayout={onImageLayout}
                uri={data.uri}
                paused={isPaused}
                isActive={isActive}
                {...videoProps}
              />
            ) : (
              <NativeStoryVideo
                onLoad={onContentLoad}
                onLayout={onImageLayout}
                uri={data.uri}
                paused={isPaused}
                isActive={isActive}
                {...videoProps}
              />
            )
          ) : (
            <Image
              source={{ uri: data.uri }}
              style={{ width: WIDTH, aspectRatio: 0.5626 }}
              resizeMode="contain"
              testID="storyImageComponent"
              onLayout={( e ) => onImageLayout( Math.min( HEIGHT, e.nativeEvent.layout.height ) )}
              onLoad={() => onContentLoad()}
            />
          )
        )}
      </View>
    </>
  );

};

export default memo( StoryImage );
