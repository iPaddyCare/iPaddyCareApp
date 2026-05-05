/**
 * Single-column wheel picker — snap-scrolling list with a highlighted center row,
 * inspired by the Material 3 time picker / Android alarm-app style.
 *
 * No native deps; pure JS over a ScrollView with snapToInterval.
 *
 * Props:
 *  - items: array of strings or numbers to choose from
 *  - selectedIndex: index of the currently-selected item (controlled)
 *  - onChange: (index) => void — fired when the wheel settles on a new index
 *  - itemHeight?: row height in px (default 44)
 *  - visibleCount?: number of rows visible at once (must be odd, default 5)
 *  - width?: width of the column in px (default 56)
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const ITEM_HEIGHT_DEFAULT = 44;
const VISIBLE_DEFAULT = 5;
const WIDTH_DEFAULT = 56;

export default function WheelPicker({
  items,
  selectedIndex = 0,
  onChange,
  itemHeight = ITEM_HEIGHT_DEFAULT,
  visibleCount = VISIBLE_DEFAULT,
  width = WIDTH_DEFAULT,
}) {
  const scrollRef = useRef(null);
  const containerHeight = itemHeight * visibleCount;
  const padding = (containerHeight - itemHeight) / 2;

  // Keep the wheel synced when `selectedIndex` changes externally.
  useEffect(() => {
    const target = Math.max(0, Math.min(items.length - 1, selectedIndex)) * itemHeight;
    // small delay so the ScrollView mounts before we scroll
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: target, animated: false });
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedIndex, itemHeight, items.length]);

  const handleMomentumEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / itemHeight);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (clamped !== selectedIndex) {
      onChange?.(clamped);
    }
  };

  return (
    <View style={[styles.container, { height: containerHeight, width }]}>
      {/* selection band */}
      <View
        pointerEvents="none"
        style={[
          styles.selectionBand,
          {
            top: padding,
            height: itemHeight,
          },
        ]}
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{ paddingVertical: padding }}
        nestedScrollEnabled
      >
        {items.map((item, i) => {
          const distance = Math.abs(i - selectedIndex);
          const isCenter = distance === 0;
          return (
            <View
              key={`${item}-${i}`}
              style={[styles.row, { height: itemHeight }]}
            >
              <Text
                style={[
                  styles.rowText,
                  isCenter && styles.rowTextCenter,
                  distance === 1 && styles.rowTextNear,
                  distance >= 2 && styles.rowTextFar,
                ]}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  selectionBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15,81,50,0.08)',
    borderRadius: 10,
  },
  row: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    fontSize: 22,
    fontWeight: '500',
  },
  rowTextCenter: {
    color: '#0F5132',
    fontWeight: '800',
    fontSize: 26,
  },
  rowTextNear: {
    color: 'rgba(0,0,0,0.55)',
  },
  rowTextFar: {
    color: 'rgba(0,0,0,0.25)',
  },
});
