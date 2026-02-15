/**
 * TypeScript declaration for SVG file imports.
 *
 * With react-native-svg-transformer configured in Metro, every `.svg`
 * file is compiled into a React component that accepts standard
 * react-native-svg `SvgProps` (width, height, fill, color, etc.).
 *
 * Usage:
 *   import Logo from '../assets/images/pakuni-logo.svg';
 *   <Logo width={80} height={80} />
 */
declare module '*.svg' {
  import type {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
