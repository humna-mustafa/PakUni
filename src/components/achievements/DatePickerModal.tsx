/**
 * DatePickerModal - Custom date picker modal for achievements
 * Uses scroll-based day/month/year selection without external dependencies
 */
import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const ITEM_HEIGHT = 46;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 10}, (_, i) => currentYear - i);

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

interface WheelPickerProps {
  items: (string | number)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  colors: any;
}

const WheelPicker: React.FC<WheelPickerProps> = ({items, selectedIndex, onSelect, colors}) => {
  const scrollRef = useRef<ScrollView>(null);

  const handleScrollEnd = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    if (clampedIndex !== selectedIndex) {
      onSelect(clampedIndex);
    }
  }, [selectedIndex, onSelect, items.length]);

  const scrollToIndex = useCallback((index: number) => {
    scrollRef.current?.scrollTo({y: index * ITEM_HEIGHT, animated: true});
  }, []);

  return (
    <View style={styles.wheelWrapper}>
      {/* Selection highlight */}
      <View style={[styles.selectionHighlight, {borderColor: colors.primary + '40', backgroundColor: colors.primary + '10'}]} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentOffset={{x: 0, y: selectedIndex * ITEM_HEIGHT}}
        contentContainerStyle={{paddingVertical: ITEM_HEIGHT * 2}}
        style={{height: PICKER_HEIGHT}}>
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.wheelItem]}
              onPress={() => {
                onSelect(index);
                scrollToIndex(index);
              }}
              activeOpacity={0.7}>
              <Text style={[
                styles.wheelItemText,
                {color: isSelected ? colors.primary : colors.textSecondary},
                isSelected && styles.selectedItemText,
              ]}>
                {String(item).padStart(typeof item === 'number' && item < 100 ? 2 : 0, '0')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dateStr: string) => void;
  initialDate?: string; // DD/MM/YYYY format
  colors: any;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible, onClose, onConfirm, initialDate, colors,
}) => {
  // Parse initial date
  const parseInitial = () => {
    if (initialDate) {
      const parts = initialDate.split('/');
      if (parts.length === 3) {
        return {
          day: parseInt(parts[0]) - 1,
          month: parseInt(parts[1]) - 1,
          year: YEARS.indexOf(parseInt(parts[2])),
        };
      }
    }
    const now = new Date();
    return {
      day: now.getDate() - 1,
      month: now.getMonth(),
      year: YEARS.indexOf(now.getFullYear()),
    };
  };

  const initial = parseInitial();
  const [selectedDay, setSelectedDay] = useState(initial.day >= 0 ? initial.day : 0);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedYear, setSelectedYear] = useState(initial.year >= 0 ? initial.year : 0);

  const daysInMonth = getDaysInMonth(selectedMonth + 1, YEARS[selectedYear]);
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

  // Clamp day when month/year changes reduce available days
  const clampedDay = Math.min(selectedDay, daysInMonth - 1);
  if (clampedDay !== selectedDay) {
    // Use setTimeout to avoid setState-during-render
    setTimeout(() => setSelectedDay(clampedDay), 0);
  }

  const handleConfirm = () => {
    const day = String(clampedDay + 1).padStart(2, '0');
    const month = String(selectedMonth + 1).padStart(2, '0');
    const year = YEARS[selectedYear];
    onConfirm(`${day}/${month}/${year}`);
    onClose();
  };

  const formattedDate = `${String(clampedDay + 1).padStart(2, '0')} ${MONTHS[selectedMonth]} ${YEARS[selectedYear]}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View />
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={[styles.sheet, {backgroundColor: colors.card}]}>
          {/* Header */}
          <View style={[styles.header, {borderBottomColor: colors.border}]}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, {color: colors.textSecondary}]}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Icon name="calendar" family="Ionicons" size={18} color={colors.primary} />
              <Text style={[styles.headerTitle, {color: colors.text}]}>Select Date</Text>
            </View>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
              <Text style={[styles.confirmText, {color: colors.primary}]}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Selected date preview */}
          <View style={[styles.preview, {backgroundColor: colors.primary + '12'}]}>
            <Icon name="calendar-outline" family="Ionicons" size={16} color={colors.primary} />
            <Text style={[styles.previewText, {color: colors.primary}]}>{formattedDate}</Text>
          </View>

          {/* Pickers */}
          <View style={styles.pickersRow}>
            {/* Day */}
            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerLabel, {color: colors.textSecondary}]}>Day</Text>
              <WheelPicker
                items={days}
                selectedIndex={Math.min(selectedDay, days.length - 1)}
                onSelect={setSelectedDay}
                colors={colors}
              />
            </View>

            {/* Month */}
            <View style={[styles.pickerColumn, styles.monthColumn]}>
              <Text style={[styles.pickerLabel, {color: colors.textSecondary}]}>Month</Text>
              <WheelPicker
                items={MONTHS}
                selectedIndex={selectedMonth}
                onSelect={(i) => {
                  setSelectedMonth(i);
                  const maxDay = getDaysInMonth(i + 1, YEARS[selectedYear]);
                  if (selectedDay >= maxDay) setSelectedDay(maxDay - 1);
                }}
                colors={colors}
              />
            </View>

            {/* Year */}
            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerLabel, {color: colors.textSecondary}]}>Year</Text>
              <WheelPicker
                items={YEARS}
                selectedIndex={selectedYear}
                onSelect={(i) => {
                  setSelectedYear(i);
                  const maxDay = getDaysInMonth(selectedMonth + 1, YEARS[i]);
                  if (selectedDay >= maxDay) setSelectedDay(maxDay - 1);
                }}
                colors={colors}
              />
            </View>
          </View>

          {/* Confirm button */}
          <TouchableOpacity
            style={[styles.confirmButton, {backgroundColor: colors.primary}]}
            onPress={handleConfirm}
            activeOpacity={0.85}>
            <Icon name="checkmark-circle" family="Ionicons" size={20} color="#FFF" />
            <Text style={styles.confirmButtonText}>Confirm Date</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {padding: 4},
  cancelText: {fontSize: 14},
  confirmBtn: {padding: 4},
  confirmText: {fontSize: 14, fontWeight: '700'},
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  previewText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pickersRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  monthColumn: {
    flex: 1.6,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  wheelWrapper: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 1,
    pointerEvents: 'none',
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  wheelItemText: {
    fontSize: 15,
  },
  selectedItemText: {
    fontWeight: '700',
    fontSize: 17,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default DatePickerModal;
