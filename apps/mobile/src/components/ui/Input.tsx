import { forwardRef, useState } from 'react'
import { TextInput, View, type TextInputProps, type ViewStyle, type StyleProp } from 'react-native'
import { useTheme } from '../../theme'

interface Props extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>
  variant?: 'filled' | 'flat'
}

const Input = forwardRef<TextInput, Props>(function Input(
  { containerStyle, variant = 'filled', style, onFocus, onBlur, ...rest },
  ref
) {
  const theme = useTheme()
  const [focused, setFocused] = useState(false)

  return (
    <View
      style={[
        {
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: focused ? theme.colors.accent : theme.colors.borderSubtle,
          backgroundColor: variant === 'filled' ? theme.colors.bgSurface : 'transparent',
        },
        containerStyle,
      ]}
    >
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
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.bodyLarge,
            paddingHorizontal: theme.spacing[4],
            paddingVertical: 14,
          },
          style,
        ]}
      />
    </View>
  )
})

export default Input
