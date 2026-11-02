// mobile/src/features/items/components/ItemGallery.tsx

import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

/* =========================================================
   TYPES
========================================================= */

export interface ItemGalleryImage {
  id?: string;
  uri: string;
  alt?: string;
}

interface ItemGalleryProps {
  images?: ItemGalleryImage[];
  title?: string;
  initialIndex?: number;
  height?: number;
  showThumbnails?: boolean;
  showCounter?: boolean;
  allowFullScreen?: boolean;
  onImagePress?: (index: number) => void;
  onImageChange?: (index: number) => void;
  emptyMessage?: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const COLORS = {
  primary: "#2563EB",
  background: "#F1F5F9",
  white: "#FFFFFF",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  dark: "#020617",
};

const SCREEN_WIDTH = Dimensions.get("window").width;

/* =========================================================
   COMPONENT
========================================================= */

const ItemGallery: React.FC<ItemGalleryProps> = ({
  images = [],
  title = "Item images",
  initialIndex = 0,
  height = 290,
  showThumbnails = true,
  showCounter = true,
  allowFullScreen = true,
  onImagePress,
  onImageChange,
  emptyMessage = "No images have been uploaded.",
}) => {
  const navigation = useNavigation<any>();

  const validImages = useMemo(
    () =>
      images.filter(
        (image) =>
          image && typeof image.uri === "string" && image.uri.trim().length > 0,
      ),
    [images],
  );

  const safeInitialIndex = Math.max(
    0,
    Math.min(initialIndex, Math.max(validImages.length - 1, 0)),
  );

  const [activeIndex, setActiveIndex] = useState(safeInitialIndex);

  const [failedImages, setFailedImages] = useState<string[]>([]);

  const [loadingImages, setLoadingImages] = useState<string[]>([]);

  const flatListRef = React.useRef<FlatList<ItemGalleryImage>>(null);

  /* =======================================================
     UPDATE ACTIVE IMAGE
  ======================================================= */

  const updateActiveIndex = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(index, validImages.length - 1));

      setActiveIndex(safeIndex);

      onImageChange?.(safeIndex);
    },
    [validImages.length, onImageChange],
  );

  /* =======================================================
     IMAGE LOADING
  ======================================================= */

  const handleLoadStart = useCallback((uri: string) => {
    setLoadingImages((previous) =>
      previous.includes(uri) ? previous : [...previous, uri],
    );
  }, []);

  const handleLoadEnd = useCallback((uri: string) => {
    setLoadingImages((previous) => previous.filter((image) => image !== uri));
  }, []);

  /* =======================================================
     IMAGE ERROR
  ======================================================= */

  const handleImageError = useCallback(
    (uri: string) => {
      setFailedImages((previous) =>
        previous.includes(uri) ? previous : [...previous, uri],
      );

      handleLoadEnd(uri);
    },
    [handleLoadEnd],
  );

  /* =======================================================
     OPEN FULL SCREEN
  ======================================================= */

  const openFullScreen = useCallback(
    (index: number) => {
      if (onImagePress) {
        onImagePress(index);
        return;
      }

      if (!allowFullScreen) {
        return;
      }

      navigation.navigate("ImageViewer", {
        images: validImages.map((image) => image.uri),
        initialIndex: index,
        title,
      });
    },
    [onImagePress, allowFullScreen, navigation, validImages, title],
  );

  /* =======================================================
     THUMBNAIL PRESS
  ======================================================= */

  const selectThumbnail = useCallback(
    (index: number) => {
      updateActiveIndex(index);

      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    },
    [updateActiveIndex],
  );

  /* =======================================================
     RENDER IMAGE
  ======================================================= */

  const renderImage = useCallback(
    ({ item, index }: ListRenderItemInfo<ItemGalleryImage>) => {
      const failed = failedImages.includes(item.uri);

      return (
        <Pressable
          style={[styles.imageSlide, { height }]}
          onPress={() => openFullScreen(index)}
          accessibilityRole="button"
          accessibilityLabel={item.alt || `Open image ${index + 1}`}
        >
          {!failed ? (
            <>
              <Image
                source={{ uri: item.uri }}
                style={styles.mainImage}
                resizeMode="cover"
                onLoadStart={() => handleLoadStart(item.uri)}
                onLoadEnd={() => handleLoadEnd(item.uri)}
                onError={() => handleImageError(item.uri)}
              />

              {loadingImages.includes(item.uri) && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator color={COLORS.primary} size="large" />
                </View>
              )}
            </>
          ) : (
            <View style={styles.failedContainer}>
              <Text style={styles.failedIcon}>🖼️</Text>

              <Text style={styles.failedText}>Image unavailable</Text>
            </View>
          )}

          <View style={styles.expandIcon}>
            <Text style={styles.expandText}>⛶</Text>
          </View>
        </Pressable>
      );
    },
    [
      height,
      failedImages,
      loadingImages,
      openFullScreen,
      handleLoadStart,
      handleLoadEnd,
      handleImageError,
    ],
  );

  /* =======================================================
     EMPTY GALLERY
  ======================================================= */

  if (validImages.length === 0) {
    return (
      <View style={[styles.emptyGallery, { height }]}>
        <Text style={styles.emptyIcon}>📷</Text>

        <Text style={styles.emptyTitle}>No photos available</Text>

        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      </View>
    );
  }

  /* =======================================================
     MAIN RENDER
  ======================================================= */

  return (
    <View style={styles.container}>
      {/* Main image list */}

      <View style={styles.mainGallery}>
        <FlatList
          ref={flatListRef}
          data={validImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item.id || `${item.uri}-${index}`}
          renderItem={renderImage}
          initialScrollIndex={safeInitialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
            );

            updateActiveIndex(index);
          }}
        />

        {/* Image counter */}

        {showCounter && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {validImages.length}
            </Text>
          </View>
        )}
      </View>

      {/* Thumbnail list */}

      {showThumbnails && validImages.length > 1 && (
        <FlatList
          horizontal
          data={validImages}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `thumbnail-${item.id || index}`}
          contentContainerStyle={styles.thumbnailList}
          renderItem={({ item, index }) => {
            const selected = activeIndex === index;

            return (
              <Pressable
                onPress={() => selectThumbnail(index)}
                style={[
                  styles.thumbnailWrapper,
                  selected && styles.selectedThumbnail,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select image ${index + 1}`}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  mainGallery: {
    width: "100%",
    position: "relative",
    backgroundColor: COLORS.background,
  },

  imageSlide: {
    width: SCREEN_WIDTH,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },

  mainImage: {
    width: "100%",
    height: "100%",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },

  counter: {
    position: "absolute",
    right: 15,
    bottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(2,6,23,0.75)",
  },

  counterText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },

  expandIcon: {
    position: "absolute",
    left: 13,
    bottom: 13,
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "rgba(2,6,23,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  expandText: {
    color: COLORS.white,
    fontSize: 19,
  },

  thumbnailList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 9,
  },

  thumbnailWrapper: {
    width: 65,
    height: 65,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },

  selectedThumbnail: {
    borderColor: COLORS.primary,
  },

  thumbnail: {
    width: "100%",
    height: "100%",
  },

  emptyGallery: {
    width: "100%",
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  emptyIcon: {
    fontSize: 43,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptyMessage: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 7,
    textAlign: "center",
  },

  failedContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  failedIcon: {
    fontSize: 35,
    marginBottom: 8,
  },

  failedText: {
    fontSize: 11,
    color: COLORS.secondary,
  },
});

export default ItemGallery;
