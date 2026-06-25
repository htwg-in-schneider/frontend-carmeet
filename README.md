# CarMeet – Frontend

CarMeet ist eine Community-Plattform für Autobegeisterte. Nutzer können Fahrzeuge einstellen, Events erstellen und daran teilnehmen sowie innerhalb von Events miteinander chatten.

---

## Tech Stack

| Technologie | Version |
|---|---|
| Vue 3 (Composition API) | ^3.5 |
| Vue Router | ^5.0 |
| Pinia (State Management) | ^3.0 |
| Auth0 (Authentifizierung) | ^2.7 |
| Vite (Build Tool) | ^8.0 |

---

## Lokal starten

**Voraussetzungen:** Node.js ≥ 20

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App läuft dann unter `http://localhost:5173`.

> **Hinweis:** Das Backend muss ebenfalls laufen (standardmäßig auf Port 8081). Ist es nicht erreichbar, arbeitet die App im Offline-Mock-Modus mit localStorage-Daten.

---

## Projektstruktur

```
src/
├── main.js               # Einstiegspunkt (Auth0, Pinia, Router initialisieren)
├── App.vue               # Root-Komponente (Navbar + Footer Layout)
├── data.js               # Statische Mock-Daten (Onboarding-Schritte, Events)
│
├── views/                # Seiten – je eine pro Route
│   ├── HomeView.vue
│   ├── ProductCatalog.vue
│   ├── ProductDetail.vue
│   ├── CreateProduct.vue
│   ├── EditProduct.vue
│   ├── EventDetailView.vue
│   ├── UserEventsView.vue
│   ├── UserVehiclesView.vue
│   ├── ProfileView.vue
│   ├── BecomeEventManagerView.vue
│   ├── AdminView.vue
│   ├── AdminUsersView.vue
│   ├── AdminEventsView.vue
│   ├── AdminCategoriesView.vue
│   ├── AdminVehicleManagementView.vue
│   ├── AdminTransactionsView.vue
│   └── CallbackView.vue  # Auth0-Redirect-Handler nach Login
│
├── components/           # Wiederverwendbare UI-Komponenten
│   ├── Navbar.vue / UserNavbar.vue / AdminNavbar.vue
│   ├── EventCard.vue
│   ├── ProductCard.vue / ProductFilter.vue / ProductReviews.vue
│   ├── NotificationToast.vue
│   ├── ConfirmDeleteModal.vue
│   └── AddressAutocomplete.vue
│
├── router/
│   ├── index.js          # Routen-Definitionen
│   └── guards.js         # Routen-Guards (authGuard, adminGuard, userOnlyGuard)
│
├── stores/               # Pinia Stores
│   ├── userStore.js      # Nutzerprofil und Auth-Status
│   ├── eventStore.js     # Events, Teilnahmen, Nachrichten
│   ├── notificationsStore.js
│   └── banner.js
│
└── services/             # API-Kommunikation zum Backend
    ├── eventService.js
    ├── productService.js
    ├── profileService.js
    ├── adminService.js
    ├── auditService.js
    ├── categoryService.js
    └── reviewService.js
```

---

## Routen

| Pfad | Seite | Zugang |
|---|---|---|
| `/` | Startseite | öffentlich |
| `/products` | Fahrzeugkatalog | öffentlich |
| `/products/:id` | Fahrzeugdetail | öffentlich |
| `/products/create` | Fahrzeug erstellen | eingeloggt |
| `/products/edit/:id` | Fahrzeug bearbeiten | Eigentümer / Admin |
| `/event/:id` | Eventdetail + Chat | eingeloggt |
| `/user/events` | Meine Events | eingeloggt |
| `/user/vehicles` | Meine Fahrzeuge | eingeloggt |
| `/profile` | Profil bearbeiten | eingeloggt |
| `/user/become-event-manager` | Event-Manager werden | eingeloggt |
| `/admin` | Admin-Dashboard | Admin |
| `/admin/users` | Nutzerverwaltung | Admin |
| `/admin/events` | Eventverwaltung | Admin |
| `/admin/categories` | Kategorieverwaltung | Admin |
| `/admin/fahrzeugverwaltung` | Fahrzeug-Hub (Kategorie / Fahrzeug / Bewertung) | Admin |
| `/admin/transactions` | Audit-Log | Admin |

---

## Authentifizierung

Die App nutzt **Auth0** für Login und Logout. Nach dem Login leitet Auth0 auf `/callback` weiter, wo der Token entgegengenommen wird. Alle geschützten API-Anfragen senden den Token als `Authorization: Bearer ...` Header mit.

**Rollen:**
- `USER` – Standard-Nutzer
- `ADMIN` – Vollzugang inkl. Admin-Bereich
- `EVENTMANAGER` – Kann Events erstellen (wird über das Profil beantragt)

---

## Features im Überblick

### Fahrzeugkatalog
Fahrzeuge einstellen, bearbeiten und löschen. Filterbar nach Name und Kategorie. Jedes Fahrzeug kann mit 1–5 Sternen bewertet werden.

### Events
Nutzer können Events beitreten und wieder verlassen. Event-Manager erstellen und verwalten Events. Innerhalb eines Events gibt es einen Chat für alle Teilnehmer.

### Profil
Vor-/Nachname und Geburtsdatum hinterlegen. Event-Manager-Status kann über die Profilseite beantragt werden.

### Admin-Bereich
Nutzer verwalten (Rollen vergeben, sperren, löschen), Kategorien und Events verwalten. Das Audit-Log zeigt alle Systemaktionen mit Zeitstempel und Nutzer.

### Benachrichtigungen
Toast-Benachrichtigungen erscheinen bei Erfolg oder Fehler und blenden sich automatisch aus.

---

## Umgebungsvariablen

Konfiguration in `.env.development` (lokal) bzw. `.env.production` (Deployment):

```env
VITE_AUTH0_DOMAIN=        # Auth0 Domain
VITE_AUTH0_CLIENT_ID=     # Auth0 Client ID
VITE_AUTH0_AUDIENCE=      # API-Audience (z.B. https://api.carmeet.de)
VITE_API_BASE_URL=        # Backend-URL (http://localhost:8081 im Dev)
```

---

## Build & Deployment

```bash
# Produktions-Build erzeugen
npm run build
```

Das Projekt wird automatisch via **GitHub Actions** auf **GitHub Pages** deployed, sobald auf `main` gepusht wird.

Produktions-URL: `https://htwg-in-schneider.github.io/frontend-carmeet/`
