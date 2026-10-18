# Privacy and security

PharmaGO asks users for their **health conditions** (diabetes, high blood pressure, pregnancy,
kidney or liver disease, …) so it can warn them about unsuitable medicines. Health data is a
special category of personal data, so protecting it is the main security concern of this project.

## Main risk

> **Health data is stored in the browser without encryption, on a device that may be shared.**

Our users are elderly people. Many of them share a phone or tablet with family members, or use a
computer in a pharmacy or library. PharmaGO keeps its data in the browser's `localStorage`, which
is **not encrypted**. Anyone who opens the same browser on that device, or anyone with access to
the device's files, can read the user's name, phone number and health conditions.

A second, smaller risk: data could leave the device without the user knowing, through third-party
scripts, fonts or analytics.

## Our response

| Measure                 | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Where                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Consent**             | Health conditions are saved only if the user ticks _"I agree that my health conditions are saved on this device to warn me about unsuitable medicines"_. Without consent they can still register, but no conditions are saved. Consent can be withdrawn in Profile, which removes the conditions. The rule is enforced in the store on **every** update, not only in the form, so no screen can bypass it. Data saved before consent existed is cleaned when the app loads. | `src/lib/privacy.ts` (`conditionsToSave`, `sanitizeUser`), `src/lib/store.tsx`, `src/routes/login.tsx`, `src/routes/profile.tsx` |
| **Local-only storage**  | All data stays in this browser's `localStorage` under keys starting with `pharmago`. There is no backend. The password typed at sign-in is **not stored**.                                                                                                                                                                                                                                                                                                                  | `src/lib/store.tsx`                                                                                                              |
| **No network requests** | The app makes no `fetch`/XHR/beacon calls and uses no analytics. Fonts that were loaded from Google Fonts (which shares the visitor's IP address with Google) are now self-hosted. The Lovable editor's error-reporting hook was removed.                                                                                                                                                                                                                                   | `src/styles.css` (`@fontsource`), `src/routes/__root.tsx`                                                                        |
| **Delete my data**      | A button in Profile and on the Privacy page asks for confirmation, then removes **every** `pharmago*` key from this browser, resets the app and returns to the welcome page. Nothing is written back afterwards.                                                                                                                                                                                                                                                            | `deleteMyData` in `src/lib/privacy.ts`, `deleteAllData` in `src/lib/store.tsx`, `src/components/Privacy.tsx`                     |
| **Clearing on logout**  | Logging out removes the user record (name, phone number, health conditions) and the saved delivery addresses from storage.                                                                                                                                                                                                                                                                                                                                                  | `logout` in `src/lib/store.tsx`                                                                                                  |
| **Old data cleanup**    | Data saved by older versions of the app (`pharmago-v1` … `pharmago-v3`) is deleted on load.                                                                                                                                                                                                                                                                                                                                                                                 | `removeLegacyData` in `src/lib/privacy.ts`                                                                                       |
| **Transparency**        | A plain-English **Privacy** page (linked in the footer and in Profile) says what is stored, where, that nothing is sent anywhere, that everything is demo data, and how to delete it. A note under the health profile says the data never leaves the device.                                                                                                                                                                                                                | `src/routes/privacy.tsx`                                                                                                         |
| **Medical disclaimer**  | Every page footer says: _"Demo project. Information is not medical advice. In an emergency call 103."_                                                                                                                                                                                                                                                                                                                                                                      | `Footer` in `src/components/Shell.tsx`                                                                                           |
| **No accidental calls** | Pharmacy "Contact" buttons show the number in a message and never dial (`tel:`) the demo numbers, which might belong to real people.                                                                                                                                                                                                                                                                                                                                        | `src/components/Pharmacy.tsx`                                                                                                    |

## What we checked and how

**1. Automated tests** (`npm test`; 41 tests pass, run on GitHub Actions for every push to `main`)

| Test file                         | What it proves                                                                                                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/test/privacy.test.ts`        | Conditions are not saved without consent and are saved with it; old data without consent is cleaned; _Delete my data_ removes every `pharmago*` key but leaves other sites' data alone; old versions' keys are removed on load. |
| `src/test/privacy-store.test.tsx` | Using the real store and `localStorage`: no conditions are written without consent; logout leaves no health conditions or addresses in storage; _Delete my data_ leaves no `pharmago*` key and nothing is written back.         |

As a check that these tests really protect the behaviour, we removed the consent rule and the
"don't write back after delete" guard on purpose: the tests failed, then passed again once the
code was restored.

**2. Code search** for anything that sends data:

```sh
grep -rnE "fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|https?://|analytics|gtag" src
```

Found and fixed: Google Fonts links in `src/routes/__root.tsx` (now self-hosted) and the Lovable
error-reporting hook (removed). The only remaining `fetch` is in `src/server.ts`: the **server's**
own request handler, not an outgoing request. We also searched the built client bundle
(`.output/public`) for external hosts: only XML namespace strings (`www.w3.org`) and documentation
links inside library error messages remain, and none of them is requested.

**3. Browser check (DevTools Network tab)**. We registered a test user, ticked Diabetes, used
Profile, a medicine page, the Options page and the Privacy page, and logged out. Every request went
to the app's own address (`localhost:8080`). **No request went to any other host, and there were no
`fetch`/XHR/beacon requests at all.** In `localStorage` we checked that:

- after registering **without** consent: `conditions: []`, no password;
- after giving consent in Profile and ticking Diabetes: `conditions: ["diabetes"]` (and Teraflu shows the warning);
- after **Log out**: `user: null`, the word "diabetes" no longer appears in storage;
- after **Delete my data**: no `pharmago` keys at all, and the app returns to the welcome page.

To repeat it: open DevTools → **Network**, use the app, and check the _Domain_ column. Then
open **Application → Local Storage** to see exactly what is stored.

**4. Dependencies:** `npm audit --omit=dev` reports 0 known vulnerabilities.

## Known limitations

- **Data is not encrypted.** Anyone using the same browser profile, or with access to the device,
  can read it. Encrypting it in the browser would not really help, because the key would also
  have to be stored in the browser.
- **The admin login `admin` / `admin` is hard-coded in the client code** (`src/routes/admin.tsx`),
  and "logged in as admin" is just a flag in `localStorage`. Anyone can read the code or set the
  flag. It only protects demo stock data.
- **Sign-in is not real authentication.** Any password is accepted and it is never checked or
  stored. Name and phone number are saved in plain text.
- Data stays until the user logs out or deletes it. It does not expire automatically.
- Consent is a single tick box, stored on the device only. There is no record of when consent
  was given.
- `src/components/ui/chart.tsx` (an unused library component) contains `dangerouslySetInnerHTML`
  for generated CSS. It is not used by any page.

## What a real version would need

- **Server-side storage with encryption**, both at rest (encrypted database) and in transit
  (**HTTPS** only, with HSTS). Health data only on servers located in **Uzbekistan**.
- **Real authentication**: passwords hashed with a slow algorithm such as **bcrypt** or
  **Argon2**, verification of the phone number with an SMS code, rate limiting of sign-in
  attempts, and sessions that expire. Admin accounts with separate credentials and two-factor
  authentication, never in the client code.
- **Compliance with the Law of the Republic of Uzbekistan "On Personal Data"** (No. ZRU-547,
  2019): written consent for processing, storing Uzbek citizens' personal data on servers in
  Uzbekistan (localisation requirement), registration in the State Register of Personal Data
  Databases, and a named person responsible for data protection.
- **Records of consent** (who, when, what text), a way to withdraw it, and a data-retention policy
  that automatically deletes old data.
- An **audit log** of who accessed health data, regular **security testing** (penetration
  tests), dependency scanning in CI, and a **Content-Security-Policy** header that blocks scripts
  and requests to other hosts.
- **Medical review** of all medicine information and warnings by a licensed pharmacist before
  anything is shown to real patients.
