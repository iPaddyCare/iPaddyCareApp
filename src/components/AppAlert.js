/**
 * App-wide styled alert dialog.
 *
 * Drop-in replacement for React Native's `Alert.alert`:
 *   showAppAlert(title, message, [{ text, onPress, style }, ...]);
 *
 * Mount <AppAlertHost /> once at the App root so any screen can call
 * `showAppAlert(...)` without passing props/context around.
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';

let pendingHandler = null;

/**
 * Imperative API — same shape as Alert.alert(title, message, buttons).
 * `buttons` is optional; if omitted, a single OK button closes the dialog.
 */
export function showAppAlert(title, message, buttons) {
  if (typeof pendingHandler === 'function') {
    pendingHandler({ title, message, buttons });
  } else if (__DEV__) {
    console.warn('[AppAlert] called before <AppAlertHost /> was mounted:', title);
  }
}

export function AppAlertHost() {
  const [config, setConfig] = useState(null);
  // queue alerts that arrive while one is already visible
  const queue = useRef([]);

  useEffect(() => {
    pendingHandler = (next) => {
      setConfig((current) => {
        if (current) {
          queue.current.push(next);
          return current;
        }
        return next;
      });
    };
    return () => {
      pendingHandler = null;
    };
  }, []);

  const close = () => {
    setConfig(() => {
      const nextInQueue = queue.current.shift();
      return nextInQueue || null;
    });
  };

  if (!config) return null;

  // Default OK fallback — covers all three languages with the same glyph string,
  // since 'OK' is universally understood and avoids needing the language context here.
  const buttons =
    Array.isArray(config.buttons) && config.buttons.length > 0
      ? config.buttons
      : [{ text: 'OK' }];

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => {
        const cancelBtn = buttons.find(b => b.style === 'cancel') || buttons[buttons.length - 1];
        cancelBtn?.onPress?.();
        close();
      }}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => {
          // tapping outside dismisses only if there's an explicit cancel button
          const cancelBtn = buttons.find(b => b.style === 'cancel');
          if (cancelBtn) {
            cancelBtn.onPress?.();
            close();
          }
        }}
      >
        <Pressable style={styles.dialog} onPress={() => {}}>
          {!!config.title && <Text style={styles.title}>{config.title}</Text>}
          {!!config.message && <Text style={styles.message}>{config.message}</Text>}
          <View
            style={[
              styles.buttonRow,
              buttons.length === 1 && styles.buttonRowSingle,
              buttons.length > 2 && styles.buttonColumn,
            ]}
          >
            {buttons.map((btn, idx) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              const isLast = idx === buttons.length - 1;
              const isSingle = buttons.length === 1;
              const stacked = buttons.length > 2;
              return (
                <TouchableOpacity
                  key={`${btn.text}-${idx}`}
                  style={[
                    styles.button,
                    isSingle && styles.buttonSingle,
                    !isSingle && !stacked && styles.buttonFlex,
                    stacked && styles.buttonStacked,
                    isCancel && styles.buttonCancel,
                    isDestructive && styles.buttonDestructive,
                    !isCancel && !isDestructive && styles.buttonPrimary,
                    buttons.length === 2 && !isLast && { marginRight: 8 },
                    stacked && idx > 0 && { marginTop: 8 },
                  ]}
                  onPress={() => {
                    btn.onPress?.();
                    close();
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isCancel && styles.buttonTextCancel,
                      isDestructive && styles.buttonTextDestructive,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 18,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
    marginBottom: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonRowSingle: {
    justifyContent: 'center',
  },
  buttonColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  button: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonStacked: {
    width: '100%',
  },
  buttonFlex: {
    flex: 1,
  },
  buttonSingle: {
    minWidth: 96,
  },
  buttonPrimary: {
    backgroundColor: '#0F5132',
  },
  buttonCancel: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  buttonDestructive: {
    backgroundColor: '#C62828',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonTextCancel: {
    color: '#1A1A1A',
  },
  buttonTextDestructive: {
    color: '#FFFFFF',
  },
});
