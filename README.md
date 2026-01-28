# QR Generátor - VITAR Sport

Interný QR kód generátor s logami ENERVIT a ROYALBAY, UTM parametrami a sledovaním skenov.

## Funkcie

- Generovanie QR kódov s vloženým logom (ENERVIT / ROYALBAY)
- UTM parametre pre sledovanie kampaní
- Analytika - počet skenov pre každý QR kód
- Prihlásenie pre interný tím
- Stiahnutie QR kódov ako PNG alebo SVG

## Technológie

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Autentifikácia**: NextAuth.js
- **Databáza**: Supabase (PostgreSQL)
- **QR kódy**: qr-code-styling
- **Hosting**: Vercel

## Inštalácia

### 1. Naklonujte repozitár

```bash
git clone https://github.com/jurajgiacko/qrkodgenerator.git
cd qrkodgenerator
npm install
```

### 2. Nastavte Supabase

1. Vytvorte projekt na [supabase.com](https://supabase.com)
2. V SQL Editor spustite obsah súboru `supabase-schema.sql`
3. Skopírujte Project URL a Service Role Key

### 3. Nastavte environment variables

```bash
cp .env.example .env.local
```

Vyplňte hodnoty v `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - URL vášho Supabase projektu
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key z Supabase
- `NEXTAUTH_SECRET` - náhodný reťazec (napr. `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL` - URL vašej aplikácie (pri lokálnom vývoji `http://localhost:3000`)

### 4. Vytvorte používateľa

Vygenerujte hash hesla:

```bash
npx ts-node scripts/create-user.ts
```

Potom v Supabase SQL Editor spustite vygenerovaný INSERT príkaz.

### 5. Pridajte logá

Nahrajte logá ENERVIT a ROYALBAY do:
- `public/logos/enervit.png`
- `public/logos/royalbay.png`

Ideálna veľkosť: 200x200px s transparentným pozadím.

### 6. Spustite vývojový server

```bash
npm run dev
```

Otvorte [http://localhost:3000](http://localhost:3000)

## Deployment na Vercel

1. Nahrajte projekt na GitHub
2. Importujte projekt na [vercel.com](https://vercel.com)
3. Pridajte environment variables v Vercel dashboard
4. Aktualizujte `NEXT_PUBLIC_APP_URL` a `NEXTAUTH_URL` na produkčnú URL

## Ako funguje sledovanie skenov

1. QR kód smeruje na `https://vasadomena.vercel.app/r/abc123`
2. Server zaznamená sken do databázy
3. Používateľ je presmerovaný na cieľovú URL s UTM parametrami
4. Dashboard zobrazuje počet skenov pre každý QR kód

## Štruktúra projektu

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth API
│   │   └── qr/                   # QR CRUD API
│   ├── dashboard/                # Dashboard stránka
│   ├── login/                    # Prihlásenie
│   ├── r/[shortId]/              # Redirect endpoint
│   └── page.tsx                  # QR Generátor
├── components/
│   ├── providers/
│   └── ui/                       # shadcn/ui komponenty
└── lib/
    ├── auth.ts                   # NextAuth konfigurácia
    ├── supabase.ts               # Supabase klient
    └── qr-utils.ts               # Pomocné funkcie
```
