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

export type ButtonVariant = 'primary' | 'ghost' | 'subtle' | 'danger'
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
  children,
  ...rest
}: Props) {
  const theme = useTheme()
  const scale = useRef(new Animated.Value(1)).current

  const sizeStyle: ViewStyle =
    size === 'sm'
      ? { paddingVertical: 8, paddingHorizontal: 14, borderRadius: theme.radius.sm }
      : size === 'lg'
      ? { paddingVertical: 16, paddingHorizontal: 22, borderRadius: theme.radius.md }
      : { paddingVertical: 12, paddingHorizontal: 18, borderRadius: theme.radius.md }

  const variantStyle: ViewStyle =
    variant === 'primary'
      ? { backgroundColor: theme.colors.accent }
      : variant === 'danger'
      ? { backgroundColor: theme.colors.dangerMuted, borderWidth: 1, borderColor: theme.colors.danger }
      : variant === 'subtle'
      ? { backgroundColor: theme.colors.bgElevated, borderWidth: 1, borderColor: theme.colors.borderSubtle }
      : {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.borderDefault,
        }

  const textTone: 'primary' | 'accent' | 'danger' =
    variant === 'primary' ? 'primary' : variant === 'danger' ? 'danger' : variant === 'ghost' ? 'primary' : 'primary'

  const textColor = variant === 'primary' ? '#fff' : undefined

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
          <ActivityIndicator color={variant === 'primary' ? '#fff' : theme.colors.accent} />
        ) : (
          <>
            {leading ? <View>{leading}</View> : null}
            {children ??
              (label ? (
                <Text
                  variant={size === 'sm' ? 'label' : 'body'}
                  weight="semibold"
                  tone={textTone}
                  style={textColor ? { color: textColor } : undefined}
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
