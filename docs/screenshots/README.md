# 📸 PakUni Screenshots

This folder contains all the app screenshots used in the README and documentation.

## 📋 Required Screenshots

To complete the README documentation, please add the following screenshots:

### Home & Navigation
| Filename | Description | Recommended Size |
|----------|-------------|------------------|
| `pakuni-logo.png` | App logo (square) | 512x512 px |
| `app-banner.png` | Wide app banner | 1200x400 px |
| `home-light.png` | Home screen in light mode | 1080x1920 px |
| `home-dark.png` | Home screen in dark mode | 1080x1920 px |
| `navigation.png` | Bottom tab navigation | 1080x1920 px |

### University Explorer
| Filename | Description | Recommended Size |
|----------|-------------|------------------|
| `universities-list.png` | University listing screen | 1080x1920 px |
| `university-detail.png` | University detail view | 1080x1920 px |
| `university-filters.png` | Filter/search interface | 1080x1920 px |

### Merit Calculator
| Filename | Description | Recommended Size |
|----------|-------------|------------------|
| `calculator.png` | Calculator input screen | 1080x1920 px |
| `calculator-result.png` | Calculator result display | 1080x1920 px |
| `shareable-card.png` | Shareable result card | 1080x1920 px |

### Scholarships & Career
| Filename | Description | Recommended Size |
|----------|-------------|------------------|
| `scholarships.png` | Scholarship listing | 1080x1920 px |
| `career-guidance.png` | Career guidance screen | 1080x1920 px |
| `career-roadmap.png` | Career roadmap view | 1080x1920 px |

### Profile & Settings
| Filename | Description | Recommended Size |
|----------|-------------|------------------|
| `profile.png` | User profile screen | 1080x1920 px |
| `settings.png` | Settings screen | 1080x1920 px |
| `onboarding.png` | Onboarding flow | 1080x1920 px |

### Additional Screens
| Filename | Description | Recommended Size |
|----------|-------------|------------------|
| `entry-tests.png` | Entry test preparation | 1080x1920 px |
| `compare.png` | University comparison | 1080x1920 px |
| `notifications.png` | Notifications screen | 1080x1920 px |

## 📝 How to Take Screenshots

### Android Emulator
1. Run the app: `npm run android`
2. Navigate to the screen you want to capture
3. Press `Ctrl + S` or click the camera icon in the emulator toolbar
4. Screenshots are saved to your Desktop or Downloads folder

### Physical Android Device
1. Connect your device via USB
2. Enable Developer options and USB debugging
3. Run: `adb exec-out screencap -p > screenshot.png`

### iOS Simulator (macOS only)
1. Run the app: `npm run ios`
2. Press `Cmd + S` to take a screenshot
3. Screenshots are saved to your Desktop

## 🖼️ Image Optimization

Before adding screenshots, optimize them for web:

```bash
# Using ImageMagick
magick input.png -resize 540x960 -quality 85 output.png

# Using pngquant (for PNG compression)
pngquant --quality=65-80 screenshot.png
```

## 📱 Device Frames (Optional)

For a more professional look, you can add device frames using:
- [Device Frames](https://deviceframes.com/)
- [Mockuphone](https://mockuphone.com/)
- [Screely](https://www.screely.com/)

---

*Once you've added screenshots, they will automatically appear in the README.md file!*
