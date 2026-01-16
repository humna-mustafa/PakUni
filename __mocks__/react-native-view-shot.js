// Mock for react-native-view-shot
export const captureRef = jest.fn(() => Promise.resolve('/mock/path/to/screenshot.png'));
export default {
  captureRef,
};
