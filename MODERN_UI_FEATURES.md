# Modern UI/UX Features - PakUni

## Overview
This update adds cutting-edge gesture interactions and smooth animations to PakUni, making it feel like a modern 2025 app with fluid, responsive interactions.

## New Dependencies

```bash
npm install react-native-reanimated@^3.17.0
```

**babel.config.js** now includes the reanimated plugin:
```js
plugins: ['react-native-reanimated/plugin']
```

---

## 🎯 New Components

### 1. SwipeableCard
Swipe-to-action card with smooth spring animations.

```tsx
import { SwipeableCard } from '../components';

<SwipeableCard
  leftAction={{
    icon: 'heart',
    color: '#FFFFFF',
    backgroundColor: '#EF4444',
    onAction: () => toggleFavorite(),
    label: 'Favorite',
  }}
  rightAction={{
    icon: 'trash',
    color: '#FFFFFF',
    backgroundColor: '#6B7280',
    onAction: () => deleteItem(),
    label: 'Delete',
  }}
>
  <YourCardContent />
</SwipeableCard>
```

**Features:**
- Swipe left/right to reveal actions
- Haptic feedback at threshold
- Auto-snap back or complete action
- Rubber-band physics at edges

---

### 2. AnimatedPressable
Modern pressable with spring scale animation.

```tsx
import { AnimatedPressable } from '../components';

<AnimatedPressable
  onPress={() => navigate()}
  onLongPress={() => showMenu()}
  hapticFeedback
  scaleOnPress={0.97}
>
  <Text>Tap Me</Text>
</AnimatedPressable>
```

**Features:**
- Smooth scale animation on press
- Long press detection
- Configurable haptic feedback
- Accessible by default

---

### 3. GestureBottomSheet
Drag-to-dismiss bottom sheet with snap points.

```tsx
import { GestureBottomSheet, GestureBottomSheetRef } from '../components';

const sheetRef = useRef<GestureBottomSheetRef>(null);

<GestureBottomSheet
  ref={sheetRef}
  initialSnap="collapsed"
  onClose={() => setVisible(false)}
  headerComponent={<Text>Filter Options</Text>}
>
  <FilterContent />
</GestureBottomSheet>

// Control programmatically
sheetRef.current?.expand();
sheetRef.current?.snapToHalf();
sheetRef.current?.dismiss();
```

**Features:**
- Three snap points: collapsed, half, expanded
- Velocity-based snapping
- Backdrop with animated opacity
- Android back button support

---

### 4. AnimatedList
High-performance FlatList with entrance animations.

```tsx
import { AnimatedList, ParallaxHeader } from '../components';

<AnimatedList
  data={universities}
  renderItem={({item, index, scrollY}) => (
    <UniversityCard item={item} />
  )}
  enableStaggeredAnimation
  staggerDelay={50}
  headerComponent={<HeroSection />}
  headerHeight={200}
  enableParallaxHeader
  onRefresh={async () => fetchData()}
/>
```

**Features:**
- Staggered entrance animations
- Parallax header effects
- Smooth scroll-linked animations
- Built-in pull-to-refresh

---

### 5. PullToRefreshView
Custom pull-to-refresh with animated indicator.

```tsx
import { PullToRefreshView } from '../components';

<PullToRefreshView
  onRefresh={async () => {
    await fetchLatestData();
  }}
>
  <YourScrollContent />
</PullToRefreshView>
```

**Features:**
- Custom animated refresh indicator
- Rotating icon animation
- Progress-based scaling
- Haptic feedback

---

### 6. SwipeableUniversityCard
Ready-to-use university card with swipe actions.

```tsx
import { SwipeableUniversityCard } from '../components';

<SwipeableUniversityCard
  item={university}
  index={index}
  onPress={() => navigate('UniversityDetail', {id: university.id})}
  onToggleFavorite={(id) => toggleFavorite(id)}
  onAddToCompare={(id) => addToCompare(id)}
  isFavorite={favorites.includes(university.id)}
  enableSwipe
/>
```

**Features:**
- Swipe right: Add/remove favorite
- Swipe left: Add to compare
- Entrance animations
- Brand color integration

---

## 🎨 Animation Hooks

### useScalePress
```tsx
const {animatedStyle, onPressIn, onPressOut} = useScalePress(1, 0.97);

<Animated.View style={animatedStyle}>
  <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
    <Text>Press Me</Text>
  </Pressable>
</Animated.View>
```

### useDragAnimation
```tsx
const {
  translateX,
  translateY,
  animatedStyle,
  onGestureStart,
  onGestureActive,
  onGestureEnd,
} = useDragAnimation({
  boundaries: {minX: -100, maxX: 100},
  snapPoints: {x: [-100, 0, 100]},
  rubberBand: true,
});
```

### useEntranceAnimation
```tsx
const {animatedStyle} = useEntranceAnimation({
  type: 'slideUp', // 'fade' | 'scale' | 'slide' | 'slideDown'
  delay: 200,
  duration: 300,
});
```

### useParallaxScroll
```tsx
const scrollY = useSharedValue(0);
const {createParallaxStyle, createOpacityStyle} = useParallaxScroll(scrollY);

const headerStyle = createParallaxStyle(0.5); // 50% parallax
const fadeStyle = createOpacityStyle(0, 200); // Fade between 0-200 scroll
```

---

## 🚀 Navigation Transitions

### Custom Screen Transitions
```tsx
import {
  DefaultScreenOptions,
  ModalScreenOptions,
  DetailScreenOptions,
  iOSSlideTransition,
} from '../navigation/transitions';

// In your navigator
<Stack.Screen
  name="UniversityDetail"
  component={DetailScreen}
  options={DetailScreenOptions}
/>

<Stack.Screen
  name="FilterModal"
  component={FilterScreen}
  options={ModalScreenOptions}
/>
```

### Available Transitions
- `FadeTransition` - Simple fade
- `ScaleFadeTransition` - Scale + fade for detail screens
- `SlideFromBottomTransition` - Modal presentation
- `iOSSlideTransition` - iOS-style slide with parallax
- `MaterialSharedAxisTransition` - Material Design motion

---

## 📱 Best Practices

### 1. Use Gestures Appropriately
```tsx
// ✅ Good - clear swipe actions
<SwipeableCard
  leftAction={{icon: 'heart', label: 'Favorite'}}
  rightAction={{icon: 'trash', label: 'Delete'}}
/>

// ❌ Avoid - unlabeled or confusing actions
<SwipeableCard
  leftAction={{icon: 'question'}}
/>
```

### 2. Respect Reduced Motion
```tsx
import { useReducedMotion } from '../hooks';

const reducedMotion = useReducedMotion();

<AnimatedList
  enableStaggeredAnimation={!reducedMotion}
  staggerDelay={reducedMotion ? 0 : 50}
/>
```

### 3. Haptic Feedback
```tsx
import { Haptics } from '../utils/haptics';

// Light feedback for selections
Haptics.impact('light');

// Medium for threshold crossings  
Haptics.impact('medium');

// Success/error for action completion
Haptics.success();
Haptics.error();
```

### 4. Performance Tips
```tsx
// Use memo for list items
const ListItem = memo(({item}) => <Card item={item} />);

// Limit staggered animations to visible items
<AnimatedListItem
  enableEntrance={index < 15} // Only animate first 15
/>
```

---

## 🎬 Quick Start Example

```tsx
import React, {useRef} from 'react';
import {View} from 'react-native';
import {
  AnimatedList,
  SwipeableUniversityCard,
  GestureBottomSheet,
  GestureBottomSheetRef,
  PremiumButton,
} from '../components';

const ModernUniversitiesScreen = () => {
  const sheetRef = useRef<GestureBottomSheetRef>(null);
  const [universities, setUniversities] = useState([]);
  
  return (
    <View style={{flex: 1}}>
      <AnimatedList
        data={universities}
        renderItem={({item, index}) => (
          <SwipeableUniversityCard
            item={item}
            index={index}
            onPress={() => navigate('Detail')}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(item.id)}
          />
        )}
        enableStaggeredAnimation
        onRefresh={fetchUniversities}
      />
      
      <PremiumButton
        label="Filters"
        onPress={() => sheetRef.current?.expand()}
      />
      
      <GestureBottomSheet ref={sheetRef} initialSnap="collapsed">
        <FilterOptions />
      </GestureBottomSheet>
    </View>
  );
};
```

---

## Files Added/Modified

### New Files
- `src/components/gestures/SwipeableCard.tsx`
- `src/components/gestures/AnimatedPressable.tsx`
- `src/components/gestures/GestureBottomSheet.tsx`
- `src/components/gestures/AnimatedList.tsx`
- `src/components/gestures/PullToRefreshView.tsx`
- `src/components/gestures/index.ts`
- `src/components/cards/SwipeableUniversityCard.tsx`
- `src/components/cards/index.ts`
- `src/hooks/useGestureAnimation.ts`
- `src/navigation/transitions.ts`

### Modified Files
- `babel.config.js` - Added reanimated plugin
- `package.json` - Added react-native-reanimated
- `src/components/index.ts` - Exported new components
- `src/hooks/index.ts` - Exported new hooks

---

## Summary

The app now has:
- ✅ **Swipe gestures** - Swipe cards for actions
- ✅ **Smooth animations** - 60fps spring physics
- ✅ **Haptic feedback** - Touch feedback on interactions
- ✅ **Pull-to-refresh** - Custom animated refresh
- ✅ **Bottom sheets** - Gesture-controlled modals
- ✅ **Parallax effects** - Scroll-linked animations
- ✅ **Page transitions** - Smooth navigation animations
- ✅ **Staggered lists** - Animated list item entrances

This brings PakUni up to modern 2025 app standards with fluid, responsive interactions that feel native and polished.
