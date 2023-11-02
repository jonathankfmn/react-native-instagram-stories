import React, { FC, memo, useRef, useState } from "react";
import { LayoutChangeEvent, Platform } from "react-native";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";
import { StoryVideoProps } from "../../core/dto/componentsDTO";
import { WIDTH, HEIGHT } from "../../core/constants";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";

const StoryVideo: FC<StoryVideoProps> = ({
  uri,
  paused,
  isActive,
  onLoad,
  onLayout,
  ...props
}) => {
  try {
    const ref = useRef<any>(null);

    const [pausedValue, setPausedValue] = useState(!paused.value);

    const start = () => ref.current?.playFromPositionAsync(0);

    useAnimatedReaction(
      () => paused.value,
      (res, prev) => res !== prev && runOnJS(setPausedValue)(!res),
      [paused.value]
    );

    useAnimatedReaction(
      () => isActive.value,
      (res) => res && runOnJS(start)(),
      [isActive.value]
    );

    const onLoadFuntion = (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        onLoad(status.durationMillis ?? 0);
      }
    };

    return (
      <Video
        ref={ref}
        source={{
          uri: uri,
        }}
        style={{
          width: WIDTH,
          aspectRatio: 0.5626,
          height: Platform.OS === "ios" ? HEIGHT - 90 : HEIGHT,
        }}
        shouldPlay={pausedValue}
        {...props}
        useNativeControls={false}
        isLooping={false}
        onLoad={(status) => onLoadFuntion(status)}
        resizeMode={ResizeMode.COVER}
        onLayout={(e: LayoutChangeEvent) =>
          onLayout(e.nativeEvent.layout.height)
        }
      />
    );
  } catch (error) {
    return null;
  }
};

export default memo(StoryVideo);
