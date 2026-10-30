# Implementation evidence — 2026-10-30

- Browser project/input/editor, low-poly camera controls, preview takes and image-to-video handoff are implemented.
- Image workflow: Nano Banana 2.1, source frame + character sheet + 3D guide.
- Video workflow: Seedance 2.5, approved preview + character sheet + 3D camera/motion guide.
- Separate Comfy runs produced real image and video results on the painter-workshop case.
- The private workshop is prepared/reference-assisted; arbitrary automatic 3D recovery and browser IK editing are not implemented.
- Actual paid execution through the app server is not verified. Mock-provider tests cover transport and state handling only.
- Local full test suite: 11 passed. In the public release, the private-fixture test skips when its excluded media is absent.
- Latest layout browser visual QA was blocked by an automation-tool initialization error. Local HTTP responses and module syntax were checked.
- Public release excludes private workshop media, supplied FBX, credentials and runtime records.
