// Mock for react-native-share
export default {
  open: jest.fn(() => Promise.resolve({ success: true })),
  shareSingle: jest.fn(() => Promise.resolve({ success: true })),
  isPackageInstalled: jest.fn(() => Promise.resolve(true)),
};
