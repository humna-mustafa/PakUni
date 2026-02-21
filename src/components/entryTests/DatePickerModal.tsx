/**
 * DatePickerModal - Wheel-based date picker for test countdown custom dates
 * Uses scroll-wheel UI for ease of use (no manual text entry)
 */

import React, {useState, useRef, useCallback, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

const ITEM_HEIGHT = 46;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 8}, (_, i) => currentYear + i);

const getDaysInMonth = (month: number, year: number) =>
  new Date(year, month, 0).getDate();

/** Internal wheel column component */
const WheelPicker: React.FC<{
  items: (string | number)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  colors: any;
}> = ({items, selectedIndex, onSelect, colors}) => {
  const ref = useRef<ScrollView>(null);
  const onEnd = useCallback((e: any) => {
    const idx = Math.max(0, Math.min(Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT), items.length - 1));
    if (idx !== selectedIndex) onSelect(idx);
  }, [selectedIndex, onSelect, items.length]);
  return (
    <View style={wStyles.wrap}>
      <View style={[wStyles.highlight, {borderColor: colors.primary + '40', backgroundColor: colors.primary + '12'}]} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onEnd}
        onScrollEndDrag={onEnd}
        contentOffset={{x: 0, y: selectedIndex * ITEM_HEIGHT}}
        contentContainerStyle={{paddingVertical: ITEM_HEIGHT * 2}}
        style={{height: PICKER_HEIGHT}}>
        {items.map((item, idx) => (
          <TouchableOpacity key={idx} style={wStyles.item} activeOpacity={0.7}
            onPress={() => { onSelect(idx); ref.current?.scrollTo({y: idx * ITEM_HEIGHT, animated: true}); }}>
            <Text style={[
              wStyles.itemText, {color: idx === selectedIndex ? colors.primary : colors.textSecondary},
              idx === selectedIndex && wStyles.selectedText,
            ]}>
              {typeof item === 'number' && item < 100 ? String(item).padStart(2, '0') : String(item)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const wStyles = StyleSheet.create({
  wrap: {width: '100%', alignItems: 'center', position: 'relative'},
  highlight: {position: 'absolute', top: ITEM_HEIGHT * 2, left: 4, right: 4, height: ITEM_HEIGHT, borderRadius: 10, borderWidth: 1, zIndex: 1},
  item: {height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', width: '100%'},
  itemText: {fontSize: 15},
  selectedText: {fontWeight: '700', fontSize: 17},
});

interface Props {
  visible: boolean;
  colors: any;
  dateInput: string;
  onChangeText: (text: string) => void;
  hasCustomDate: boolean;
  onSave: () => void;
  onClear: () => void;
  onClose: () => void;
}

const DatePickerModal: React.FC<Props> = ({
  visible, colors, dateInput, onChangeText, hasCustomDate, onSave, onClear, onClose,
}) => {
  /** Parse existing dateInput (e.g. "July 15, 2025") into indices */
  const parse = () => {
    const now = new Date();
    if (dateInput) {
      const parts = dateInput.match(/(\w+)\s+(\d+),?\s+(\d{4})/);
      if (parts) {
        const mIdx = MONTHS.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
        const d = parseInt(parts[2]) - 1;
        const yIdx = YEARS.indexOf(parseInt(parts[3]));
        if (mIdx >= 0 && d >= 0 && yIdx >= 0) {
          return {m: mIdx, d, y: yIdx};
        }
      }
    }
    return {m: now.getMonth(), d: now.getDate() - 1, y: YEARS.indexOf(now.getFullYear()) >= 0 ? YEARS.indexOf(now.getFullYear()) : 0};
  };

  const init = parse();
  const [selMonth, setSelMonth] = useState(init.m);
  const [selDay, setSelDay] = useState(init.d);
  const [selYear, setSelYear] = useState(init.y);

  const daysCount = getDaysInMonth(selMonth + 1, YEARS[selYear]);
  const days = Array.from({length: daysCount}, (_, i) => i + 1);
  const clampedDay = Math.min(selDay, daysCount - 1);

  // Sync formatted date back to parent as user scrolls
  useEffect(() => {
    const day = clampedDay + 1;
    const formatted = `${MONTHS[selMonth]} ${day}, ${YEARS[selYear]}`;
    if (formatted !== dateInput) onChangeText(formatted);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selMonth, clampedDay, selYear]);

  const formatted = `${MONTHS[selMonth]} ${clampedDay + 1}, ${YEARS[selYear]}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.container}>
        <View style={[styles.sheet, {backgroundColor: colors.card}]}>
          {/* Handle bar */}
          <View style={[styles.handle, {backgroundColor: colors.border}]} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Text style={[styles.headerBtnTxt, {color: colors.textSecondary}]}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Icon name="calendar" family="Ionicons" size={18} color={colors.primary} />
              <Text style={[styles.headerTitle, {color: colors.text}]}>Set Test Date</Text>
            </View>
            {hasCustomDate ? (
              <TouchableOpacity onPress={onClear} style={styles.headerBtn}>
                <Text style={[styles.headerBtnTxt, {color: '#EF4444'}]}>Clear</Text>
              </TouchableOpacity>
            ) : <View style={styles.headerBtn} />}
          </View>

          {/* Preview */}
          <View style={[styles.preview, {backgroundColor: colors.primary + '12'}]}>
            <Icon name="calendar-outline" family="Ionicons" size={16} color={colors.primary} />
            <Text style={[styles.previewText, {color: colors.primary}]}>{formatted}</Text>
          </View>

          {/* Wheels */}
          <View style={styles.wheels}>
            <View style={[styles.col, styles.monthCol]}>
              <Text style={[styles.colLabel, {color: colors.textSecondary}]}>Month</Text>
              <WheelPicker items={MONTHS} selectedIndex={selMonth}
                onSelect={i => { setSelMonth(i); const max = getDaysInMonth(i + 1, YEARS[selYear]); if (selDay >= max) setSelDay(max - 1); }}
                colors={colors} />
            </View>
            <View style={styles.col}>
              <Text style={[styles.colLabel, {color: colors.textSecondary}]}>Day</Text>
              <WheelPicker items={days} selectedIndex={Math.min(selDay, days.length - 1)}
                onSelect={setSelDay} colors={colors} />
            </View>
            <View style={styles.col}>
              <Text style={[styles.colLabel, {color: colors.textSecondary}]}>Year</Text>
              <WheelPicker items={YEARS} selectedIndex={selYear}
                onSelect={i => { setSelYear(i); const max = getDaysInMonth(selMonth + 1, YEARS[i]); if (selDay >= max) setSelDay(max - 1); }}
                colors={colors} />
            </View>
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, {backgroundColor: colors.primary}]}
            onPress={onSave}
            activeOpacity={0.85}>
            <Icon name="checkmark-circle" family="Ionicons" size={20} color="#FFF" />
            <Text style={styles.saveTxt}>Set Countdown Date</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBtn: {minWidth: 60},
  headerBtnTxt: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.medium},
  headerCenter: {flexDirection: 'row', alignItems: 'center', gap: 6},
  headerTitle: {fontSize: 16, fontWeight: TYPOGRAPHY.weight.bold},
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: RADIUS.lg,
  },
  previewText: {fontSize: 15, fontWeight: TYPOGRAPHY.weight.semibold},
  wheels: {flexDirection: 'row', paddingHorizontal: 8},
  col: {flex: 1, alignItems: 'center'},
  monthCol: {flex: 1.6},
  colLabel: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveTxt: {color: '#FFF', fontSize: 15, fontWeight: TYPOGRAPHY.weight.bold},
});

export default DatePickerModal;
