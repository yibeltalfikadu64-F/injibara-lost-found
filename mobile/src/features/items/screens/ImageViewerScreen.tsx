// mobile/src/features/items/screens/ImageViewerScreen.tsx

import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

/* =========================================================
   CONFIGURATION
========================================================= */

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  background: "#020617",
  white: "#FFFFFF",
  secondary: "#94A3B8",
  primary: "#2563EB",
  overlay: "rgba(15,23,42,0.75)",
};

/* =========================================================
   TYPES
========================================================= */

interface ImageViewerParams {
  images?: string[];
  initialIndex?: number;
  title?: string;
}

/* =========================================================
   MAIN SCREEN
========================================================= */

const ImageViewerScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const route = useRoute<any>();

  const params = (route.params || {}) as ImageViewerParams;

  const images = useMemo(
    () =>
      Array.isArray(params.images)
        ? params.images.filter(
            (image) => typeof image === "string" && image.trim().length > 0,
          )
        : [],
    [params.images],
  );

  const startingIndex = Math.max(
    0,
    Math.min(params.initialIndex ?? 0, Math.max(images.length - 1, 0)),
  );

  const [activeIndex, setActiveIndex] = useState(startingIndex);

  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  const [failedImages, setFailedImages] = useState<string[]>([]);

  /* =======================================================
     IMAGE LOADED
  ======================================================= */

  const handleImageLoad = useCallback((imageUrl: string) => {
    setLoadedImages((previous) =>
      previous.includes(imageUrl) ? previous : [...previous, imageUrl],
    );

    setFailedImages((previous) =>
      previous.filter((image) => image !== imageUrl),
    );
  }, []);

  /* =======================================================
     IMAGE FAILED
  ======================================================= */

  const handleImageError = useCallback((imageUrl: string) => {
    setFailedImages((previous) =>
      previous.includes(imageUrl) ? previous : [...previous, imageUrl],
    );
  }, []);

  /* =======================================================
     TRACK CURRENT IMAGE
  ======================================================= */

  const handleScroll = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;

      const index = Math.round(offsetX / SCREEN_WIDTH);

      setActiveIndex(Math.max(0, Math.min(index, images.length - 1)));
    },
    [images.length],
  );

  /* =======================================================
     NAVIGATE TO PREVIOUS IMAGE
  ======================================================= */

  const goToPrevious = useCallback(() => {
    if (activeIndex <= 0) {
      return;
    }

    const previousIndex = activeIndex - 1;

    setActiveIndex(previousIndex);

    scrollRef.current?.scrollTo({
      x: previousIndex * SCREEN_WIDTH,
      animated: true,
    });
  }, [activeIndex]);

  /* =======================================================
     NAVIGATE TO NEXT IMAGE
  ======================================================= */

  const goToNext = useCallback(() => {
    if (activeIndex >= images.length - 1) {
      return;
    }

    const nextIndex = activeIndex + 1;

    setActiveIndex(nextIndex);

    scrollRef.current?.scrollTo({
      x: nextIndex * SCREEN_WIDTH,
      animated: true,
    });
  }, [activeIndex, images.length]);

  /* =======================================================
     SCROLL REF
  ======================================================= */

  const scrollRef = React.useRef<ScrollView>(null);

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (images.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar hidden backgroundColor={COLORS.background} />

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </Pressable>

        <Text style={styles.emptyIcon}>🖼️</Text>

        <Text style={styles.emptyTitle}>No images available</Text>

        <Text style={styles.emptyDescription}>
          This item does not have any images to display.
        </Text>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const currentImage = images[activeIndex];

  const isCurrentImageLoaded = loadedImages.includes(currentImage);

  const isCurrentImageFailed = failedImages.includes(currentImage);

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <View style={styles.container}>
      <StatusBar hidden backgroundColor={COLORS.background} />

      {/* Top toolbar */}

      <SafeAreaView style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.toolbarButton}
          accessibilityRole="button"
          accessibilityLabel="Close image viewer"
        >
          <Text style={styles.toolbarCloseText}>×</Text>
        </Pressable>

        <View style={styles.toolbarCenter}>
          <Text numberOfLines={1} style={styles.toolbarTitle}>
            {params.title || "Item Images"}
          </Text>

          <Text style={styles.toolbarSubtitle}>
            {activeIndex + 1} of {images.length}
          </Text>
        </View>

        <View style={styles.toolbarPlaceholder} />
      </SafeAreaView>

      {/* Image loading indicator */}

      {!isCurrentImageLoaded && !isCurrentImageFailed && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.white} />

          <Text style={styles.loadingText}>Loading image...</Text>
        </View>
      )}

      {/* Main image gallery */}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        contentOffset={{
          x: startingIndex * SCREEN_WIDTH,
          y: 0,
        }}
        style={styles.gallery}
      >
        {images.map((imageUrl, index) => (
          <View key={`${imageUrl}-${index}`} style={styles.imagePage}>
            <Image
              source={{
                uri: imageUrl,
              }}
              style={styles.fullImage}
              resizeMode="contain"
              onLoad={() => handleImageLoad(imageUrl)}
              onError={() => handleImageError(imageUrl)}
            />

            {failedImages.includes(imageUrl) && (
              <View style={styles.imageError}>
                <Text style={styles.imageErrorIcon}>⚠️</Text>

                <Text style={styles.imageErrorTitle}>Image unavailable</Text>

                <Text style={styles.imageErrorDescription}>
                  This image could not be loaded.
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Previous button */}

      {activeIndex > 0 && (
        <Pressable
          onPress={goToPrevious}
          style={[styles.navigationButton, styles.previousButton]}
          accessibilityRole="button"
          accessibilityLabel="Previous image"
        >
          <Text style={styles.navigationButtonText}>‹</Text>
        </Pressable>
      )}

      {/* Next button */}

      {activeIndex < images.length - 1 && (
        <Pressable
          onPress={goToNext}
          style={[styles.navigationButton, styles.nextButton]}
          accessibilityRole="button"
          accessibilityLabel="Next image"
        >
          <Text style={styles.navigationButtonText}>›</Text>
        </Pressable>
      )}

      {/* Bottom image indicators */}

      <SafeAreaView style={styles.bottomBar}>
        <View style={styles.pagination}>
          {images.map((image, index) => (
            <Pressable
              key={`${image}-indicator`}
              onPress={() => {
                setActiveIndex(index);

                scrollRef.current?.scrollTo({
                  x: index * SCREEN_WIDTH,
                  animated: true,
                });
              }}
              style={[
                styles.paginationDot,
                activeIndex === index && styles.paginationDotActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`View image ${index + 1}`}
            />
          ))}
        </View>

        <Text style={styles.bottomHint}>
          Swipe left or right to view more images
        </Text>
      </SafeAreaView>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 30,
  },

  closeButton: {
    position: "absolute" as const,
    top: 45,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: COLORS.overlay,
    zIndex: 10,
  },

  closeButtonText: {
    color: COLORS.white,
    fontSize: 29,
    lineHeight: 33,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900" as const,
    color: COLORS.white,
  },

  emptyDescription: {
    fontSize: 12,
    color: COLORS.secondary,
    lineHeight: 19,
    textAlign: "center" as const,
    marginTop: 10,
  },

  backButton: {
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },

  backButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800" as const,
  },

  topBar: {
    height: 75,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 17,
    backgroundColor: COLORS.background,
    zIndex: 5,
  },

  toolbarButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: COLORS.overlay,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  toolbarCloseText: {
    fontSize: 28,
    lineHeight: 32,
    color: COLORS.white,
  },

  toolbarCenter: {
    flex: 1,
    alignItems: "center" as const,
    paddingHorizontal: 10,
  },

  toolbarTitle: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: COLORS.white,
    maxWidth: 230,
  },

  toolbarSubtitle: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 4,
  },

  toolbarPlaceholder: {
    width: 39,
  },

  gallery: {
    flex: 1,
  },

  imagePage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 150,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 160,
  },

  loadingOverlay: {
    position: "absolute" as const,
    top: "45%" as const,
    left: 0,
    right: 0,
    alignItems: "center" as const,
    zIndex: 2,
  },

  loadingText: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 10,
  },

  imageError: {
    position: "absolute" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 25,
  },

  imageErrorIcon: {
    fontSize: 37,
    marginBottom: 10,
  },

  imageErrorTitle: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: COLORS.white,
  },

  imageErrorDescription: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 7,
  },

  navigationButton: {
    position: "absolute" as const,
    top: "48%" as const,
    width: 43,
    height: 55,
    borderRadius: 13,
    backgroundColor: COLORS.overlay,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 4,
  },

  previousButton: {
    left: 12,
  },

  nextButton: {
    right: 12,
  },

  navigationButtonText: {
    color: COLORS.white,
    fontSize: 35,
    lineHeight: 40,
  },

  bottomBar: {
    minHeight: 78,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: COLORS.background,
    paddingBottom: 10,
  },

  pagination: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    marginBottom: 10,
  },

  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#475569",
  },

  paginationDotActive: {
    width: 22,
    backgroundColor: COLORS.white,
  },

  bottomHint: {
    fontSize: 10,
    color: COLORS.secondary,
  },
};

export default ImageViewerScreen;
