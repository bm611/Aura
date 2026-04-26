import { forwardRef, useState } from 'react'
import { TextInput, View, type TextInputProps, type ViewStyle, type StyleProp } from 'react-native'
import { useTheme } from '../../theme'

interface Props extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>
  variant?: 'filled' | 'flat' | 'pill'
  leading?: React.ReactNode
  trailing?: React.ReactNode
}

const Input = forwardRef<TextInput, Props>(function Input(
  { containerStyle, variant = 'filled', style, leading, trailing, onFocus, onBlur, ...rest },
  ref
) {
  const theme = useTheme()
  const [focused, setFocused] = useState(false)

  const radius = variant === 'pill' ? theme.radius.pill : theme.radius.md
  const bg =
    variant === 'flat'
      ? 'transparent'
      : variant === 'pill'
      ? theme.colors.bgSurface
      : theme.colors.bgElevated

  return (
    <View
      style={[
        {
          borderRadius: radius,
          borderWidth: 1,
          borderColor: focused ? theme.colors.accent : theme.colors.borderSubtle,
          backgroundColor: bg,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: variant === 'pill' ? theme.spacing[4] : theme.spacing[3],
        },
        containerStyle,
      ]}
    >
      {leading ? <View style={{ marginRight: 8 }}>{leading}</View> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.accent}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        {...rest}
        style={[
          {
            flex: 1,
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.body,
            paddingVertical: variant === 'pill' ? 12 : 14,
          },
          style,
        ]}
      />
      {trailing ? <View style={{ marginLeft: 8 }}>{trailing}</View> : null}
    </View>
  )
})

export default Input
