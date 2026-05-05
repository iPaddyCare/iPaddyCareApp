/**
 * Sri Lanka phone-number input.
 *
 * Visually shows a fixed "🇱🇰 +94" prefix and a 9-digit local-number field.
 * The `value` prop and `onChangeText` callback use the existing 0-prefixed storage
 * format (e.g. "0771234567") so callers can drop this in without changing
 * validation, Firestore writes, or `tel:` dial intents.
 *
 * If we ever need multi-country support, swap the prefix for a tappable
 * country-picker button — the rest of the API stays the same.
 */
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const SL_DIAL_CODE = '+94';
const SL_FLAG = '🇱🇰';
const LOCAL_DIGITS = 9;

/**
 * @param {object} props
 * @param {string} props.value - phone in 0-prefixed format (e.g. "0771234567"). May be empty.
 * @param {(next: string) => void} props.onChangeText - called with the 0-prefixed value
 * @param {string} [props.placeholder]
 * @param {boolean} [props.error] - visual error state
 * @param {() => void} [props.onFocus]
 * @param {object} [props.style] - outer container override
 */
// Placeholder is just digits — same across languages.
export default function PhoneInput({
  value,
  onChangeText,
  placeholder = '77 123 4567',
  error = false,
  onFocus,
  onBlur,
  style,
}) {
  // Strip any non-digit, then drop a single leading "0" so the visible field
  // shows just the 9-digit subscriber number.
  const localDigits = (() => {
    if (!value) return '';
    const digitsOnly = String(value).replace(/\D/g, '');
    const trimmed = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
    return trimmed.slice(0, LOCAL_DIGITS);
  })();

  const handleChange = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, LOCAL_DIGITS);
    // Always emit in 0-prefixed format so callers' validation/storage stays intact.
    // Empty → empty string (so required-field checks still trip).
    onChangeText(digits ? `0${digits}` : '');
  };

  return (
    <View style={[styles.row, error && styles.rowError, style]}>
      <View style={styles.prefix}>
        <Text style={styles.flag}>{SL_FLAG}</Text>
        <Text style={styles.dialCode}>{SL_DIAL_CODE}</Text>
      </View>
      <View style={styles.divider} />
      <TextInput
        style={styles.input}
        value={localDigits}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType="phone-pad"
        maxLength={LOCAL_DIGITS}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    minHeight: 52,
  },
  rowError: {
    borderColor: '#C62828',
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  flag: {
    fontSize: 18,
  },
  dialCode: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});
