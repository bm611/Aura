import { useRef } from 'react'
import {
  Pressable,
  ActivityIndicator,
  Animated,
  View,
  type PressableProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native'
import { useTheme } from '../../theme'
import Text from './Text'

export type ButtonVariant = 'primary' | 'ghost' | 'subtle' | 'danger' | 'pastel'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface Props extends Omit<PressableProps, 'style'> {
  label?: string
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leading?: React.ReactNode
  trailing?: React.ReactNode
  style?: StyleProp<ViewStyle>
  /** Shape override: default pill on primary/pastel, rounded otherwise */
  pill?: boolean
}

export default function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  fullWidth,
  leading,
  trailing,
  disabled,
  style,
  pill,
  children,
  ...rest
}: Props) {
  const theme = useTheme()
  const scale = useRef(new Animated.Value(1)).current

  const isPill = pill ?? (variant === 'primary' || variant === 'pastel')
  const radius = isPill ? theme.radius.pill : theme.radius.md

  const sizeStyle: ViewStyle =
    size === 'sm'
      ? { paddingVertical: 10, paddingHorizontal: 18, borderRadius: radius }
      : size === 'lg'
      ? { paddingVertical: 18, paddingHorizontal: 26, borderRadius: radius }
      : { paddingVertical: 14, paddingHorizontal: 22, borderRadius: radius }

  const variantStyle: ViewStyle =
    variant === 'primary'
      ? { backgroundColor: theme.colors.accent }
      : variant === 'danger'
      ? { backgroundColor: theme.colors.dangerMuted, borderWidth: 1, borderColor: theme.colors.danger }
      : variant === 'subtle'
      ? { backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderSubtle }
      : variant === 'pastel'
      ? { backgroundColor: theme.colors.pastelSage }
      : {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.borderDefault,
        }

  const textColor =
    variant === 'primary'
      ? theme.colors.accentContrast
      : variant === 'pastel'
      ? theme.colors.pastelSageInk
      : variant === 'danger'
      ? theme.colors.danger
      : theme.colors.textPrimary

  function onPressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start()
  }
  function onPressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }).start()
  }

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
        fullWidth ? { alignSelf: 'stretch' } : null,
        variant === 'primary' ? theme.shadow.button : null,
      ]}
    >
      <Pressable
        {...rest}
        disabled={disabled || loading}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          sizeStyle,
          variantStyle,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? theme.colors.accentContrast : theme.colors.accent} />
        ) : (
          <>
            {leading ? <View>{leading}</View> : null}
            {children ??
              (label ? (
                <Text
                  variant={size === 'sm' ? 'label' : 'body'}
                  weight="semibold"
                  style={{ color: textColor }}
                >
                  {label}
                </Text>
              ) : null)}
            {trailing ? <View>{trailing}</View> : null}
          </>
        )}
      </Pressable>
    </Animated.View>
  )
}
