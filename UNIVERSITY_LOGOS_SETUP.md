# University Logos Setup Guide

## Overview

PakUni uses **static university logos** stored in Supabase Storage instead of external URLs (Wikipedia, university websites, etc.). This approach provides:

- ✅ **No external API calls** - Logos load from our CDN
- ✅ **Controlled costs** - No egress charges from external sources
- ✅ **Reliable loading** - No broken images from changed URLs
- ✅ **Faster performance** - CDN cached, offline friendly
- ✅ **Better UX** - Consistent loading with fallback gradients

## Storage Configuration

**Bucket:** `university-logos`
**URL Pattern:** `https://therewjnnidxlddgkaca.supabase.co/storage/v1/object/public/university-logos/{filename}`
**Max Size:** 512KB per logo
**Formats:** PNG, JPEG, SVG, WebP

## Required Logo Files

Upload the following logo files to the `university-logos` bucket:

### Islamabad (10 universities)
| Filename | University |
|----------|------------|
| `qau.png` | Quaid-i-Azam University |
| `nust.png` | NUST |
| `comsats.png` | COMSATS University |
| `iiui.png` | International Islamic University |
| `pieas.png` | PIEAS |
| `air-university.png` | Air University |
| `bahria.png` | Bahria University |
| `numl.png` | NUML |
| `fuuast.png` | Federal Urdu University |
| `cust.png` | Capital University |

### Punjab (15 universities)
| Filename | University |
|----------|------------|
| `punjab-university.png` | University of the Punjab |
| `lums.png` | LUMS |
| `uet-lahore.png` | UET Lahore |
| `kemu.png` | King Edward Medical University |
| `gcu-lahore.png` | GCU Lahore |
| `fast-nu.png` | FAST National University |
| `ucp.png` | University of Central Punjab |
| `umt.png` | UMT |
| `lcwu.png` | LCWU |
| `uol.png` | University of Lahore |
| `uaf.png` | University of Agriculture Faisalabad |
| `gcuf.png` | GCU Faisalabad |
| `bzu.png` | BZU Multan |
| `uos.png` | University of Sargodha |
| `iub.png` | Islamia University Bahawalpur |

### Sindh (7 universities)
| Filename | University |
|----------|------------|
| `uok.png` | University of Karachi |
| `ned.png` | NED University |
| `aku.png` | Aga Khan University |
| `iba.png` | IBA Karachi |
| `duhs.png` | Dow University Health Sciences |
| `muet.png` | Mehran University |
| `sindh-university.png` | University of Sindh |

### KPK (6 universities)
| Filename | University |
|----------|------------|
| `uop.png` | University of Peshawar |
| `kmu.png` | Khyber Medical University |
| `uet-peshawar.png` | UET Peshawar |
| `awkum.png` | AWKUM |
| `hazara.png` | Hazara University |

### Balochistan (2 universities)
| Filename | University |
|----------|------------|
| `uob.png` | University of Balochistan |
| `buitems.png` | BUITEMS |

### AJK (2 universities)
| Filename | University |
|----------|------------|
| `uajk.png` | University of Azad Jammu Kashmir |
| `must.png` | Mirpur University |

### Fallback
| Filename | Purpose |
|----------|---------|
| `placeholder.png` | Default fallback logo |

## Logo Guidelines

### Specifications
- **Size:** 200x200 pixels (square)
- **Format:** PNG with transparency preferred
- **File Size:** Under 100KB ideally, max 512KB
- **Background:** Transparent or white
- **Quality:** High resolution, no blur

### Where to Get Logos
1. **Official university websites** - Usually in the footer or about page
2. **HEC website** - Has official logos for all recognized universities
3. **Wikipedia Commons** - Many logos are available under free licenses

### Processing Tips
```bash
# Resize to 200x200 with ImageMagick
convert input.png -resize 200x200 -gravity center -extent 200x200 output.png

# Optimize PNG size
optipng -o7 output.png
```

## How to Upload

### Via Supabase Dashboard
1. Go to Supabase Dashboard → Storage
2. Open `university-logos` bucket
3. Click "Upload files"
4. Select logo files
5. Ensure filenames match exactly

### Via Supabase CLI
```bash
# Upload single file
supabase storage cp ./logos/nust.png sb://university-logos/nust.png

# Upload all files
for file in ./logos/*.png; do
  supabase storage cp "$file" "sb://university-logos/$(basename $file)"
done
```

## Fallback System

The `UniversityLogo` component has a built-in fallback:

1. **Try Supabase URL** - Load from static storage
2. **On Error → Gradient Fallback** - Shows university initials on a brand-colored gradient

This ensures:
- No broken image icons
- Professional appearance even without logos
- University brand colors are used for visual consistency

## Component Usage

```tsx
import UniversityLogo from '../components/UniversityLogo';

// Basic usage
<UniversityLogo 
  shortName="NUST" 
  universityName="National University of Sciences and Technology"
  size={56}
/>

// In a card
<UniversityLogo 
  shortName={university.short_name} 
  universityName={university.name}
  size={72}
  borderRadius={16}
  style={styles.logoContainer}
/>
```

## Verification

After uploading, verify logos load correctly:

1. Open the app
2. Navigate to Universities screen
3. Check each university card shows proper logo
4. Verify fallback works by temporarily removing a logo

## Troubleshooting

### Logo not showing
- Check filename matches exactly (case-sensitive)
- Verify file is in `university-logos` bucket
- Check file is public (bucket should be public)

### Logo loading slow
- Optimize file size (PNG optimization)
- Use WebP format for better compression
- Verify CDN is working

### Wrong logo displayed
- Update `universityLogos.ts` mapping
- Rebuild app after changes
