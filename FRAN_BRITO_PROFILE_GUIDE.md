# Frank Brito Executive Profile - Implementation Guide

## ✅ What's Been Built

A professional executive profile page for **Frank Brito**, Gerente General de BMS, integrated seamlessly into the BMS website with the same modern, dynamic sports app aesthetic.

---

## 📍 Where to Find It

### Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/agencia` | Agency Page | Featured leadership section with Frank Brito card + link to full profile |
| `/agencia/frank-brito` | Full Executive Profile | Complete profile with all details, stats, contact info |

### Navigation

**From Homepage:**
1. Click "Agencia" in header navigation → Goes to `/agencia`
2. Scroll down to "Leadership" section
3. See featured Frank Brito profile card
4. Click "View Full Profile" → Goes to `/agencia/frank-brito`

**Direct Link:**
- `http://localhost:3000/agencia/frank-brito`

---

## 🎨 Design & Layout

### Executive Profile Page (`/agencia/frank-brito`)

#### Hero Section
- Back link to `/agencia`
- Gradient background (dark → accent color)

#### Main Content (2-Column on Desktop)

**Left Column:**
- Large professional photo (rounded corners, shadow)
- FIBA Certification Badge (red/primary color, checkmark)
- Contact Info Card (email, phone, contact button)

**Right Column:**
- **Name & Title:** "Frank Brito" (large) + "Gerente General" (primary color)
- **Certification:** "Agente FIBA Certificado" (subtitle)
- **Featured Quote:** Highlighted in box with left border accent
- **Bio Section:** Detailed career narrative
- **Key Metrics:** 4 cards showing:
  - Years of Experience
  - Players Managed
  - Countries of Operation
  - Players in NBA
- **Countries List:** Colored pill badges
- **Social Media Links:** LinkedIn (blue), Instagram (pink), Twitter (sky)

#### Footer Sections
- **Philosophy of BMS:** 3 columns (Excellence, Trust, Global Reach)
- **CTA Section:** "Are you a basketball player?" with contact button

### Agency Page (`/agencia`) - Leadership Section

**Featured Profile Card:**
- Gradient background (dark → accent)
- Split layout: Photo on left, content on right
- FIBA badge above name
- Name + Title + Short bio excerpt (280 chars)
- 2 buttons: "View Full Profile" + "Contact"

---

## 💾 Data Structure

### File: `lib/mockData.ts`

```typescript
export const executiveProfiles: ExecutiveProfile[] = [
  {
    id: "frank-brito",
    nombre: "Frank Brito",
    cargo: "Gerente General",
    certificacion: "Agente FIBA Certificado",
    foto: "https://images.unsplash.com/...", // Professional photo
    bio: "Con más de 20 años...",              // Full biography
    cita_destacada: "El éxito de nuestros....", // Highlighted quote
    anios_experiencia: 20,                      // Number
    jugadores_gestionados: 150,                 // Number
    paises_experiencia: ["España", "USA", ...], // Array
    logros: [
      { titulo: "Años de Experiencia", valor: "20+", icono: "⏱️" },
      { titulo: "Jugadores Representados", valor: "150+", icono: "🏀" },
      { titulo: "Países de Operación", valor: "8", icono: "🌍" },
      { titulo: "Jugadores en NBA", valor: "12+", icono: "🏆" },
    ],
    redes_sociales: {
      linkedin: "https://linkedin.com/in/franbrito",
      instagram: "https://instagram.com/franbrito.bms",
      twitter: "https://twitter.com/FrankBritoBMS",
    },
    email_contacto: "fran@bmsbasketball.com",
    telefono_contacto: "+1 (555) 123-4567",
    slug: "frank-brito",
  },
];
```

---

## 🔧 How to Replace Mock Data

### Step 1: Gather Real Information

You'll need:

- [ ] Professional photo (headshot, corporate style)
- [ ] Full name and title
- [ ] FIBA certification status
- [ ] Career biography (2-3 paragraphs)
- [ ] Personal vision/quote
- [ ] Years of experience (number)
- [ ] Number of players managed (number)
- [ ] List of countries where he's worked (array)
- [ ] Achievement metrics (3-4 key stats)
- [ ] LinkedIn profile URL
- [ ] Instagram handle (if public)
- [ ] Twitter/X handle (if public)
- [ ] Professional email
- [ ] Professional phone number

### Step 2: Update `lib/mockData.ts`

Open the file and find the `executiveProfiles` array (around line 615).

```typescript
// FIND THIS:
export const executiveProfiles: ExecutiveProfile[] = [
  {
    id: "frank-brito",
    nombre: "Frank Brito",           // ← CHANGE THIS
    cargo: "Gerente General",       // ← AND THIS
    // ... etc
```

### Step 3: Replace Each Field

```typescript
// BEFORE (Mock):
nombre: "Frank Brito",
cargo: "Gerente General",
foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop",
bio: "Con más de 20 años de experiencia...",

// AFTER (Real):
nombre: "Franco Brito López",           // ← Real name
cargo: "Gerente General & Co-Founder",  // ← Real title
foto: "https://your-domain.com/fran-photo.jpg", // ← Real photo
bio: "Franco Brito brings 25+ years of experience in international basketball management...", // ← Real bio
```

### Step 4: Quick Checklist

- [ ] `nombre` — Updated with real name
- [ ] `cargo` — Updated with real title
- [ ] `certificacion` — Update if different credential
- [ ] `foto` — Real professional photo URL
- [ ] `bio` — Real career biography
- [ ] `cita_destacada` — Fran's actual quote
- [ ] `anios_experiencia` — Real number
- [ ] `jugadores_gestionados` — Real count
- [ ] `paises_experiencia` — Real list
- [ ] `logros[].valor` — Real metric values
- [ ] `redes_sociales.*` — Real profile URLs
- [ ] `email_contacto` — Real email
- [ ] `telefono_contacto` — Real phone

### Step 5: Test

1. Save the file
2. Refresh browser at `http://localhost:3000/agencia/frank-brito`
3. Verify all fields display correctly
4. Check that links work (email, phone, socials)
5. Test responsive design on mobile

---

## 🎯 Key Design Features

### Professional Yet Modern
- Dark color scheme (matches BMS branding)
- Primary accent color highlights (orange/red)
- Typography emphasizes leadership + credibility
- FIBA badge adds trust signal

### Responsive
- **Mobile:** Single column (photo, then content)
- **Desktop:** Two columns (photo left, content right)
- Buttons stack on mobile, side-by-side on desktop

### Consistent with Site
- Same color palette (`dark`, `primary`, `accent`)
- Same typography weights/sizes
- Same button styles
- Same card/shadow treatments
- Same animation classes (`animate-fadeIn`)

### Interactive Elements
- Hover states on photo (subtle scale-up if inside cards)
- Link hover colors (primary → opacity-80)
- Contact buttons (filled/outlined variants)
- Social media icon buttons (colored by platform)

---

## 📄 Files Modified/Created

### New Files
```
/app/agencia/frank-brito/page.tsx          — Executive profile page component
/MOCK_DATA_REFERENCE.md                    — Guide for replacing all mock data
/FRAN_BRITO_PROFILE_GUIDE.md              — This file
```

### Modified Files
```
/lib/types.ts                              — Added ExecutiveProfile interface
/lib/mockData.ts                           — Added executiveProfiles array
/app/agencia/page.tsx                      — Added Leadership section with featured profile
```

---

## 🔗 Links & Navigation

### Internal Links
- `/agencia` — Agency main page (shows Fran card)
- `/agencia/frank-brito` — Full profile
- `/contacto` — Contact form (linked from profile)

### External Links (Mock)
- LinkedIn: `https://linkedin.com/in/franbrito`
- Instagram: `https://instagram.com/franbrito.bms`
- Twitter: `https://twitter.com/FrankBritoBMS`
- Email: `fran@bmsbasketball.com`
- Phone: `+1 (555) 123-4567`

*(Replace with real links/contact info)*

---

## 🚀 Future Enhancements

### Possible Additions
- [ ] Photo gallery or carousel of Fran with players/events
- [ ] "In the Media" section with press mentions
- [ ] Testimonials from players about working with Fran
- [ ] Blog posts written by Fran
- [ ] Calendar/availability for meetings
- [ ] Video intro/message from Fran

### Integration Points
- [ ] Add to homepage hero (featured leader section)
- [ ] Add to footer (team leadership link)
- [ ] Create similar profiles for other team members
- [ ] Add search/filter on `/agencia` if multiple executives

---

## 📞 Support & Questions

**How to find the data:** See `MOCK_DATA_REFERENCE.md`

**How to update:** Follow steps above in "How to Replace Mock Data"

**What fields are required:** See `lib/types.ts` `ExecutiveProfile` interface

**For design changes:** Modify `/app/agencia/frank-brito/page.tsx` or `/app/agencia/page.tsx`

---

## ✨ Summary

You now have a fully functional, responsive, professional executive profile page for Frank Brito that:

✓ Matches the BMS brand identity  
✓ Uses mock data (easy to replace)  
✓ Is responsive (mobile + desktop)  
✓ Integrates with agency page  
✓ Has contact & social links  
✓ Displays credentials & achievements  
✓ Feels like a modern sports app (not a blog)  

Just replace the mock data with real information when ready!
