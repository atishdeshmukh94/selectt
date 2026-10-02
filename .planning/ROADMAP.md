# Roadmap: Selectt Platform

## Current Milestone: Quality & Asset Polish

---

### Phase 1: Remove 3rd-Party Stock Image Fallbacks & Add Hub Image Removal
**Status**: 🟡 In Progress
**Objective**: Provide an option to remove hub images in Admin (`/settings/car-hubs`), show a clean grey blank placeholder when no image is selected, and replace all 3rd-party stock image fallbacks (Unsplash/Shutterstock) sitewide with clean neutral grey/white placeholders and preloaders during data loading.

**Tasks**:
- [ ] Add image removal button ("X") and blank grey placeholder in Admin CarHubs modal (`admin/src/pages/CarHubs.tsx`)
- [ ] Ensure Admin CarHubs table renders a neutral grey placeholder when no image or image fails to load
- [ ] Remove hardcoded Unsplash photos from `frontend/src/pages/CarHubLocationsPage.jsx` default data and add grey placeholder / preloader
- [ ] Replace `DEFAULT_CAR_FALLBACK_IMAGE` and fallback error handlers across frontend and admin with clean neutral SVG/grey placeholders
- [ ] Clear the stock unsplash photo from `Pune-Viman Nagar Hub` in the live database
- [ ] Build and test changes in frontend and admin
- [ ] Push to Git (`main` and origin/wepnex)
- [ ] Deploy updates to Hostinger VPS

**Verification**:
- Editing "Pune-Viman Nagar Hub" in Admin shows the "X" button to remove the photo.
- When removed, a clean grey blank placeholder is displayed (no stock photos).
- Loading states and broken image states across frontend/admin show neutral grey/white preloaders, never 3rd-party stock photos.
