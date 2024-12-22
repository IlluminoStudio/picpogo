import { extendTheme } from '@chakra-ui/react'
import { TOAST_DURATION } from '../constants/app-constants'

const colors = {
  primary: {
    400: '#1B7AF5',
    500: '#0C70F2',
    700: '#0B65D9',
    800: '#0A5ECC',
    900: '#0954B8',
  },
  secondary: {
    400: '#F5EA4A',
    500: '#F2E41D',
    700: '#DAC717',
    800: '#C1AD14',
    900: '#A89311',
  },
  neutral: {
    '000': '#FFFFFF',
    400: '#D1D1D1',
    500: '#B3B3B3',
    700: '#808080',
    800: '#666666',
    900: '#4D4D4D',
  },
  accent: {
    500: '#1B7AF5',
  },
  background: {
    500: '#E6F4FF',
  },
  shadow: {
    500: '#B3E3F9',
  }
}

// Semantic tokens for common use cases
const semanticTokens = {
  text: {
    default: 'neutral.900',
    muted: 'neutral.700',
    inverted: 'neutral.000'
  },
  bg: {
    default: 'background.500',
    card: 'neutral.000',
    hover: 'primary.700'
  }
}

const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
}

const typography = {
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'system-ui, sans-serif',
    logo: 'Comic Sans MS, cursive'
  },
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeights: {
    normal: 'normal',
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625
  }
}

const textStyles = {
  logo: {
    fontFamily: typography.fonts.logo,
    fontWeight: typography.fontWeights.extrabold,
    textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
  }
}

const theme = extendTheme({
  colors,
  textStyles,
  spacing,
  ...typography,
  semanticTokens,
  styles: {
    global: {
      body: {
        bg: semanticTokens.bg.default,
        color: semanticTokens.text.default,
        fontSize: typography.fontSizes.md,
        fontFamily: typography.fonts.body,
        lineHeight: typography.lineHeights.base
      },
      'h1, h2, h3, h4, h5, h6': {
        fontFamily: typography.fonts.heading,
        fontWeight: typography.fontWeights.bold,
        lineHeight: typography.lineHeights.shorter
      }
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'primary',
      },
      baseStyle: {
        fontSize: typography.fontSizes.md,
        fontWeight: typography.fontWeights.medium,
        padding: `${spacing.sm} ${spacing.md}`
      },
      variants: {
        solid: {
          bg: 'primary.500',
          color: 'neutral.000',
          _hover: {
            bg: 'primary.700',
          },
          _active: {
            bg: 'primary.900',
          },
        },
      },
    },
    IconButton: {
      defaultProps: {
        colorScheme: 'primary',
      },
      baseStyle: {
        padding: spacing.xs
      }
    },
    Toast: {
      defaultProps: {
        duration: TOAST_DURATION,
        isClosable: true,
        position: 'top',
        status: 'success',
      },
      baseStyle: {
        fontSize: typography.fontSizes.sm,
        fontWeight: typography.fontWeights.medium
      }
    },
  },
})

export default theme 