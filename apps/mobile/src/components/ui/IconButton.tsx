import { useRef } from 'react'
import { Animated, Pressable, type PressableProps, type ViewStyle, type StyleProp } from 'react-native'
import { useTheme } from '../../theme'
import Text from './Text'

interface Props extends Omit<PressableProps, 'style'> {
  glyph?: string
  size?: number
  tone?: 'default' | 'accent' | 'muted' | 'danger'
  variant?: 'solid' | 'ghost'
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

export default function IconButton({
  glyph,
  size = 40,
  tone = 'default',
  variant = 'ghost',
  style,
  children,
  disabled,
  ...rest
}: Props) {
  const theme = useTheme()
  const scale = useRef(new Animated.Value(1)).current

  const bg =
    variant === 'solid'
      ? tone === 'accent'
        ? theme.colors.accent
        : theme.colors.bgElevated
      : 'transparent'

  const fg =
    tone === 'accent'
      ? variant === 'solid'
        ? '#fff'
        : theme.colors.accent
      : tone === 'danger'
      ? theme.colors.danger
      : tone === 'muted'
      ? theme.colors.textMuted
      : theme.colors.textPrimary

  function onPressIn() {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 40, bounciness: 0 }).start()
  }
  function onPressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }).start()
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        {...rest}
        disabled={disabled}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bg,
            opacity: disabled ? 0.4 : 1,
          },
          style,
        ]}
        hitSlop={8}
      >
        {children ??
          (glyph ? (
            <Text variant="bodyLarge" style={{ color: fg, fontSize: size * 0.5, lineHeight: size * 0.5 + 2 }}>
              {glyph}
            </Text>
          ) : null)}
      </Pressable>
    </Animated.View>
  )
}
