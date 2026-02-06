/**
 * Jest Setup - Global mocks for React Native modules
 * Ensures all native modules are properly mocked for testing
 */

// Mock react-native-config
jest.mock('react-native-config', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-key',
  TURSO_DATABASE_URL: 'https://test-turso.turso.io',
  TURSO_AUTH_TOKEN: 'test-token',
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn((keys) => Promise.resolve(keys.map(k => [k, null]))),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Mock react-native-haptic-feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
  HapticFeedbackTypes: {
    impactLight: 'impactLight',
    impactMedium: 'impactMedium',
    impactHeavy: 'impactHeavy',
    notificationSuccess: 'notificationSuccess',
    notificationWarning: 'notificationWarning',
    notificationError: 'notificationError',
  },
}));

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => '1.2.3'),
  getBuildNumber: jest.fn(() => '1'),
  getDeviceId: jest.fn(() => 'test-device'),
  getSystemName: jest.fn(() => 'Android'),
  getSystemVersion: jest.fn(() => '13'),
  getModel: jest.fn(() => 'Pixel 6'),
  getBrand: jest.fn(() => 'Google'),
  isEmulator: jest.fn(() => Promise.resolve(false)),
  getUniqueId: jest.fn(() => Promise.resolve('test-unique-id')),
  hasNotch: jest.fn(() => false),
}));

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  const mockStorage = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn((key, value) => mockStorage.set(key, value)),
      getString: jest.fn((key) => mockStorage.get(key)),
      getNumber: jest.fn((key) => mockStorage.get(key)),
      getBoolean: jest.fn((key) => mockStorage.get(key)),
      delete: jest.fn((key) => mockStorage.delete(key)),
      contains: jest.fn((key) => mockStorage.has(key)),
      clearAll: jest.fn(() => mockStorage.clear()),
      getAllKeys: jest.fn(() => Array.from(mockStorage.keys())),
    })),
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    SafeAreaView: ({children, ...props}) =>
      React.createElement(View, {...props, testID: 'safe-area-view'}, children),
    SafeAreaProvider: ({children}) =>
      React.createElement(View, {testID: 'safe-area-provider'}, children),
    useSafeAreaInsets: () => ({top: 44, right: 0, bottom: 34, left: 0}),
    useSafeAreaFrame: () => ({x: 0, y: 0, width: 393, height: 852}),
    initialWindowMetrics: {
      frame: {x: 0, y: 0, width: 393, height: 852},
      insets: {top: 44, right: 0, bottom: 34, left: 0},
    },
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: 'Screen',
  ScreenContainer: 'ScreenContainer',
  NativeScreen: 'NativeScreen',
  NativeScreenContainer: 'NativeScreenContainer',
}));

// Mock @react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      canGoBack: jest.fn(() => true),
    }),
    useRoute: () => ({
      params: {},
      name: 'TestScreen',
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: jest.fn(() => true),
    NavigationContainer: ({children}) => children,
  };
});

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
}));

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const {View} = require('react-native');
  const LinearGradient = ({children, ...props}) =>
    React.createElement(View, {...props, testID: 'linear-gradient'}, children);
  LinearGradient.default = LinearGradient;
  return {__esModule: true, default: LinearGradient, LinearGradient};
});

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const {Image} = require('react-native');
  const FastImage = (props) => React.createElement(Image, props);
  FastImage.resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };
  FastImage.priority = {low: 'low', normal: 'normal', high: 'high'};
  FastImage.preload = jest.fn();
  FastImage.clearMemoryCache = jest.fn(() => Promise.resolve());
  FastImage.clearDiskCache = jest.fn(() => Promise.resolve());
  return {__esModule: true, default: FastImage};
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return {
    __esModule: true,
    default: (props) => React.createElement(Text, {...props, testID: `icon-${props.name}`}, props.name),
  };
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return {
    __esModule: true,
    default: (props) => React.createElement(Text, {...props, testID: `material-icon-${props.name}`}, props.name),
  };
});

// Mock @react-native-google-signin
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() =>
      Promise.resolve({
        data: { idToken: 'mock-id-token', user: {email: 'test@example.com', name: 'Test User'} },
      }),
    ),
    signOut: jest.fn(() => Promise.resolve()),
    isSignedIn: jest.fn(() => Promise.resolve(false)),
    getCurrentUser: jest.fn(() => Promise.resolve(null)),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

// Mock @shopify/flash-list
jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const {FlatList} = require('react-native');
  return {
    FlashList: React.forwardRef((props, ref) =>
      React.createElement(FlatList, {...props, ref}),
    ),
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const {View, TouchableOpacity, ScrollView, FlatList} = require('react-native');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList,
    gestureHandlerRootHOC: (component) => component,
    Directions: {},
    GestureHandlerRootView: View,
    TouchableOpacity,
  };
});

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Mock lottie-react-native
jest.mock('lottie-react-native', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: (props) => React.createElement(View, {...props, testID: 'lottie'}),
  };
});

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    }),
  ),
}));

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(() => Promise.resolve({data: {session: null}, error: null})),
      onAuthStateChange: jest.fn(() => ({data: {subscription: {unsubscribe: jest.fn()}}})),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({data: [], error: null})),
        single: jest.fn(() => ({data: null, error: null})),
        order: jest.fn(() => ({data: [], error: null})),
      })),
      insert: jest.fn(() => ({data: null, error: null})),
      update: jest.fn(() => ({eq: jest.fn(() => ({data: null, error: null}))})),
      delete: jest.fn(() => ({eq: jest.fn(() => ({data: null, error: null}))})),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({subscribe: jest.fn()})),
    })),
  })),
}));

// Mock @libsql/client
jest.mock('@libsql/client', () => ({
  createClient: jest.fn(() => ({
    execute: jest.fn(() => Promise.resolve({rows: [], columns: []})),
    batch: jest.fn(() => Promise.resolve([])),
    close: jest.fn(),
  })),
}));

// Mock analytics
jest.mock('./src/services/analytics', () => ({
  analytics: {
    initialize: jest.fn(() => Promise.resolve()),
    trackEvent: jest.fn(),
    trackSearch: jest.fn(),
    trackScreenView: jest.fn(),
    trackScholarshipView: jest.fn(),
    endSession: jest.fn(),
    cleanup: jest.fn(),
  },
}));

// Mock Haptics utility
jest.mock('./src/utils/haptics', () => ({
  Haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    refreshThreshold: jest.fn(),
  },
}));

// Mock logger utility
jest.mock('./src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  },
}));

// Silence console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated:') ||
      args[0].includes('componentWillReceiveProps') ||
      args[0].includes('componentWillMount'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

// Silence console errors for specific expected patterns
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') ||
      args[0].includes('act(') ||
      args[0].includes('Not implemented'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};
