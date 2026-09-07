# Mock Data Reference & Replacement Guide

## Overview

The BMS website currently uses mock/placeholder data for demonstration purposes. This guide shows you what data is mock and how to replace it with real information.

---

## 1. FRAN BRITO EXECUTIVE PROFILE

**File:** `lib/mockData.ts` — `executiveProfiles` array

### Current Mock Values

```typescript
export const executiveProfiles: ExecutiveProfile[] = [
  {
    id: "frank-brito",
    nombre: "Frank Brito",                    // ✏️ REAL NAME
    cargo: "Gerente General",                // ✏️ REAL TITLE
    certificacion: "Agente FIBA Certificado", // ✏️ IF APPLICABLE
    
    // PROFILE PHOTO - Replace with professional headshot
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop",
    
    // BIOGRAPHY - Replace with Fran's actual career history
    bio: "Con más de 20 años de experiencia en la industria del baloncesto...",
    
    // HIGHLIGHTED QUOTE - Replace with Fran's actual quote/vision
    cita_destacada: "El éxito de nuestros jugadores es nuestro éxito...",
    
    // KEY METRICS - Replace with real numbers
    anios_experiencia: 20,      // ✏️ Replace with actual years
    jugadores_gestionados: 150, // ✏️ Replace with actual count
    
    // COUNTRIES OF OPERATION - Replace with real list
    paises_experiencia: [
      "España", "Estados Unidos", "Argentina", "Uruguay", 
      "Brasil", "México", "Colombia", "Puerto Rico",
    ],
    
    // ACHIEVEMENT METRICS - Replace values
    logros: [
      { titulo: "Años de Experiencia", valor: "20+", icono: "⏱️" },
      { titulo: "Jugadores Representados", valor: "150+", icono: "🏀" },
      { titulo: "Países de Operación", valor: "8", icono: "🌍" },
      { titulo: "Jugadores en NBA", valor: "12+", icono: "🏆" },
    ],
    
    // SOCIAL MEDIA - Replace with real links
    redes_sociales: {
      linkedin: "https://linkedin.com/in/frankbrito",
      instagram: "https://instagram.com/frankbrito.bms",
      twitter: "https://twitter.com/FranBritoBMS",
    },
    
    // CONTACT INFO - Replace with real contact details
    email_contacto: "fran@bmsbasketball.com",
    telefono_contacto: "+1 (555) 123-4567",
    
    slug: "frank-brito", // Usually derived from nombre
  },
];
```

### Pages Affected

- **Profile Page:** `/agencia/frank-brito`
- **Leadership Card:** Displayed on `/agencia` (Agency page)
- **Contact Links:** Email & phone links on both pages

---

## 2. PLAYER PROFILES

**File:** `lib/mockData.ts` — `mockPlayers` array

Current: **10 fictional players** (Carlos Martínez, Juan García, Mateo López, etc.)

### To Add Real Players

1. Keep the same `Player` interface structure
2. Replace each player object in `mockPlayers` with real data:
   - Photos: Use real player images (Unsplash works for now, then real URLs)
   - Stats: Actual season statistics
   - Team history: Real teams/leagues/years
   - YouTube IDs: Real highlight videos from YouTube

### Example Real Player Entry

```typescript
{
  id: "player-id-123",
  nombre: "Real Player",
  apellido: "Name",
  foto: "https://image-url.com/photo.jpg",
  nacionalidad: "Argentina",
  fecha_nacimiento: "1998-03-15",
  altura: "2.03 m",
  peso: "95 kg",
  posicion: "Alero",
  equipo_actual: "Real Madrid",
  liga_actual: "ACB",
  disponibilidad: "bajo_contrato" | "disponible" | "en_negociacion",
  historial_equipos: [ /* Real teams */ ],
  estadisticas_temporada: [ /* Real stats */ ],
  videos_youtube: [ /* Real YouTube IDs */ ],
  bio: "Real biography...",
  redes_sociales: { instagram: "...", twitter: "..." },
}
```

---

## 3. NEWS ARTICLES

**File:** `lib/mockData.ts` — `mockNews` array

Current: **4 mock articles** about fictional player news

### To Replace

1. Update `titulo`, `resumen`, `contenido` with real news
2. Update `fecha` with actual publication date
3. Replace `imagen_portada` with real article images
4. Update `jugadores_relacionados` to match real player IDs
5. Ensure `slug` is URL-friendly (no spaces, lowercase)

---

## 4. CONFIGURATION TO UPDATE

### `/lib/mockData.ts`

Before processing:
1. Find the `executiveProfiles` array
2. Update all fields marked with `✏️` 
3. For photos, use professional URLs or upload to image host

### Database/CMS Integration (Future)

When moving away from mock JSON:
- Create a database schema matching these TypeScript interfaces
- Replace imports from `lib/mockData.ts` with API calls
- Update pages to fetch data dynamically

---

## Testing After Updates

1. **Profile Page**: Visit `/agencia/frank-brito`
   - ✓ Photo displays correctly
   - ✓ Name, title, certification show
   - ✓ Quote displays in featured box
   - ✓ Contact links work (email, phone)
   - ✓ Social links point to real profiles

2. **Agency Page**: Visit `/agencia`
   - ✓ Leadership card shows updated info
   - ✓ "View Full Profile" link works
   - ✓ "Contact" button works

3. **Players Directory**: Visit `/jugadores`
   - ✓ New players appear in search/filters
   - ✓ Player cards display correctly
   - ✓ Profile pages `/jugadores/[slug]` work

4. **News**: Visit `/noticias`
   - ✓ New articles appear in feed
   - ✓ Article pages work

---

## Quick Replace Checklist

### For Frank Brito Profile

- [ ] Replace `foto` URL with professional headshot
- [ ] Update `nombre` if needed
- [ ] Update `cargo` (title)
- [ ] Replace `bio` with real career text
- [ ] Add real `cita_destacada` quote
- [ ] Update `anios_experiencia` number
- [ ] Update `jugadores_gestionados` number
- [ ] Update `paises_experiencia` list
- [ ] Update `logros` metric values
- [ ] Add real LinkedIn URL
- [ ] Add real Instagram handle (if available)
- [ ] Add real Twitter/X handle (if available)
- [ ] Update `email_contacto`
- [ ] Update `telefono_contacto`

### For Players

- [ ] Create real player entries (or import from database)
- [ ] Ensure all required fields are populated
- [ ] Validate YouTube video IDs work
- [ ] Check photo URLs are accessible

### For News

- [ ] Replace with real published articles
- [ ] Update publication dates
- [ ] Ensure article images load
- [ ] Link to actual related players

---

## File Locations Reference

| What | File | Line(s) |
|------|------|---------|
| Frank Brito profile data | `lib/mockData.ts` | ~615-665 |
| Player data | `lib/mockData.ts` | ~12-610 |
| News data | `lib/mockData.ts` | ~615 |
| Type definitions | `lib/types.ts` | All |
| Fran's page | `app/agencia/frank-brito/page.tsx` | All |
| Agency page (shows Fran card) | `app/agencia/page.tsx` | Lines 79-120 |

---

## Need Help?

Refer to the memory file: `/memory/fran_brito_profile.md` for implementation details and design notes.
