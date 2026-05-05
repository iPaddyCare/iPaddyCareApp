/**
 * Bottom-sheet picker for Price + Quantity + Unit, styled after the Android
 * alarm-app time picker — single vertical wheels per value with a highlighted
 * center row.
 *
 * Price stays typed (range too wide for a wheel). Quantity is a single 0–999
 * wheel; Unit is a single wheel over the available unit strings.
 *
 * Usage:
 *   <PriceQuantitySheet
 *     visible={...}
 *     price="1500"
 *     quantity="50"
 *     unit="kg"
 *     unitOptions={['kg','bags','litres','bundles','units']}
 *     onClose={...}
 *     onConfirm={({ price, quantity, unit }) => ...}
 *   />
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WheelPicker from './WheelPicker';
import { useLanguage } from '../context/LanguageContext';

const TR = {
  English: { price: 'Price', quantity: 'Quantity', cancel: 'Cancel', done: 'Done' },
  සිංහල: { price: 'මිල', quantity: 'ප්‍රමාණය', cancel: 'අවලංගු කරන්න', done: 'සිදු' },
  தமிழ்: { price: 'விலை', quantity: 'அளவு', cancel: 'ரத்து', done: 'முடிந்தது' },
};

const QTY_MAX = 999;

export default function PriceQuantitySheet({
  visible,
  price,
  quantity,
  unit,
  unitOptions,
  onClose,
  onConfirm,
}) {
  const insets = useSafeAreaInsets();
  const { selectedLanguage } = useLanguage();
  const t = TR[selectedLanguage] || TR.English;

  const qtyItems = useMemo(
    () => Array.from({ length: QTY_MAX + 1 }, (_, i) => String(i)),
    [],
  );

  const [priceText, setPriceText] = useState(String(price ?? ''));
  const [qtyIndex, setQtyIndex] = useState(() => {
    const n = parseInt(quantity, 10);
    if (Number.isFinite(n)) return Math.max(0, Math.min(QTY_MAX, n));
    return 0;
  });
  const [unitIndex, setUnitIndex] = useState(() => {
    const idx = unitOptions.indexOf(unit);
    return idx >= 0 ? idx : 0;
  });

  // Re-sync from props each time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    setPriceText(String(price ?? ''));
    const n = parseInt(quantity, 10);
    setQtyIndex(Number.isFinite(n) ? Math.max(0, Math.min(QTY_MAX, n)) : 0);
    const idx = unitOptions.indexOf(unit);
    setUnitIndex(idx >= 0 ? idx : 0);
  }, [visible, price, quantity, unit, unitOptions]);

  const handleConfirm = () => {
    const cleaned = priceText.replace(/[^0-9.]/g, '');
    onConfirm({
      price: cleaned || '',
      quantity: String(qtyIndex),
      unit: unitOptions[unitIndex],
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.dragHandle} />

          {/* Price */}
          <Text style={styles.sectionLabel}>{t.price}</Text>
          <View style={styles.priceField}>
            <Text style={styles.priceCurrency}>Rs.</Text>
            <View style={styles.priceDivider} />
            <TextInput
              style={styles.priceInput}
              keyboardType="numeric"
              value={priceText}
              onChangeText={(t) => setPriceText(t.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              placeholderTextColor="#999"
            />
          </View>

          {/* Quantity + Unit — alarm-style wheels */}
          <Text style={styles.sectionLabel}>{t.quantity}</Text>
          <View style={styles.wheelRow}>
            <WheelPicker
              items={qtyItems}
              selectedIndex={qtyIndex}
              onChange={setQtyIndex}
              width={96}
            />
            <View style={{ width: 16 }} />
            <WheelPicker
              items={unitOptions}
              selectedIndex={unitIndex}
              onChange={setUnitIndex}
              width={120}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>{t.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.doneBtn]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.doneText}>{t.done}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
  },
  priceField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    minHeight: 56,
    overflow: 'hidden',
  },
  priceCurrency: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F5132',
    paddingHorizontal: 16,
  },
  priceDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  priceInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  wheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  doneBtn: {
    backgroundColor: '#0F5132',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
