// Licences an asset may have (D-106). The app is free and non-commercial, so
// non-commercial licences are allowed too; every item keeps its licence so the NC ones
// can be swapped out if that ever changes. Sources whose terms forbid putting their
// content in an app / library for others (Pixabay, Unsplash, Pexels, Freepik…) are
// never used, whatever the licence name. Data in licenses.json (shared with scripts/assets).

import data from "./licenses.json";

export const LICENSES = data.licenses;
export type LicenseId = keyof typeof data.licenses;
/** Hosts whose terms forbid redistribution in a library (checked by validate.mjs). */
export const BANNED_HOSTS = data.bannedHosts;
