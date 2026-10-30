# Shotfix

**Keep the scene. Change the shot.**

An open-source camera-guided reshoot prototype for AI images and video, built with a browser 3D editor and ComfyUI workflows.

## How it works

1. Upload a source image/video and optional character sheet. The browser extracts a video reference frame.
2. Prepare a low-poly scene using an assisted layout, imported scene plan, or prepared scene.
3. Orbit/pan the camera and adjust focal length directly in 3D.
4. Generate a photographic preview with **Nano Banana 2.1**.
5. Select a preview, set camera motion and duration, then generate video with **Seedance 2.5** using a 3D motion guide.
6. Compare, restore and download takes with their camera settings.

## Actual evidence and current limits

The painter-workshop case produced a real photographic preview and approximately four-second final video in separate Comfy runs. The local demo replays those real results with recorded-output labels.

- The workshop is a prepared, reference-assisted 3D scene. Arbitrary automatic video/image-to-3D recovery is **not** demonstrated.
- The generic assisted layout is approximate, not semantic or metric reconstruction.
- Lens values control the guide, not a guaranteed calibrated lens in the generated output.
- Sample pose motion was authored in Blender. Browser IK editing and motion capture are not implemented.
- Real paid execution through the app runtime has not been tested end-to-end. Adapter tests use a mocked provider; real generation evidence comes from separate Comfy runs.
- Uses paid partner APIs. This is not an open-weights-only entry or a new foundation model.

## Run locally

Requirements: Node.js **22.12+**, npm, a WebGL-capable desktop browser. FFmpeg must be on PATH for video submission/conversion.

```sh
npm install
npm start
```

Open **http://127.0.0.1:4186/**. Upload your shot or choose **Try an example**. Projects and media are stored in this browser's IndexedDB. Localhost and hosted-domain storage are separate.

The public source release excludes private workshop media and the supplied Mixamo FBX. The special `?project=painter-workshop` route requires these local-only files; use the root URL in a clean checkout. The public illustrative example demonstrates editing, not a verified generated reshoot.

## Comfy workflows

The browser exporter and server share [public/workflows.js](public/workflows.js).

Image: image_1 = source frame; image_2 = character sheet; image_3 = edited 3D guide. Without a sheet, the guide uses image_2 and the prompt adapts.

Video: image_1 = approved preview; image_2 = character sheet; video_1 = camera/pose guide. The guide controls framing and timing; the images control appearance and identity.

[Workflow examples](workflows/) are **API-format graphs**, not draggable Comfy canvas files. Replace the named input placeholders with your files before submitting them through a compatible Comfy API. Graph construction/export does not generate anything.

## Generation configuration

Paid execution is disabled by default. Exporting a package does not upload media or spend credits. The recorded workshop demo can switch to request preparation through Workspace → Open workflow controls.

For live local requests: copy `.env.example` to `.env`, connect a Comfy Cloud API key through Workspace or `COMFY_API_KEY`, deliberately set `ALLOW_PAID_GENERATION=1`, restart, review the request and confirm each generation. Check costs and provider compatibility first. Keys entered in Workspace remain in server memory.

The server uses the official `@comfyorg/sdk`, converts guides to MP4, polls results, persists job records and guards duplicate submissions. Do not publicly expose this single-user local server. An assistant's MCP OAuth connection does not automatically authenticate the web app.

An optional OpenAI-compatible vision endpoint can supply validated scene-plan JSON through `SHOTFIX_VISION_URL`. No model endpoint is bundled or verified; the default assisted draft requires no model call.

## Tests

```sh
npm test
```

Tests cover media-role wiring, take associations, camera interpolation/restoration, validation, no-upload preflight, default paid rejection and mocked submission/result retrieval. They do not prove real paid inference or browser visual quality.

## Demo and contest

Final demo/social links are pending; add them before submitting. See [docs/SUBMISSION.md](docs/SUBMISSION.md). The older hosted camera demo is not evidence of the latest workshop generation flow.

Built for the Comfy-organized **#OpenSourceHiggsfield** challenge. No Higgsfield affiliation, endorsement or award is claimed.

## License

App code: [Apache-2.0](LICENSE). Dependencies/models retain their own terms. See [THIRD_PARTY.md](THIRD_PARTY.md). This license grants no rights to customer references, Mixamo assets or model weights.
