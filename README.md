# Super Action Doggo

Super Action Doggo is a cozy low-poly 3D browser game about being the best
dog in the park. It is built with [Three.js](https://threejs.org/) loaded from
a CDN, ships as a no-build static site, and needs nothing but a plain static
file server. This is Phase 1: the dog park with third-person dog control.
Fetch and friends arrive in later milestones.

**Play:** <https://sigurs.github.io/super-action-doggo/>

## Controls

| Action | Control |
| --- | --- |
| Select a dog | Click a dog card (or the dog) on the start screen |
| Start the game | Click **Start as …** |
| Move | **W A S D** or arrow keys (relative to the camera) |
| Run | Hold **Shift** while moving |
| Jump | **Space** (press again only after landing) |
| Sit | **C** (the dog stays seated until you move) |
| Bark | **B** |
| Look around | Move the mouse — click the view to capture the pointer (**Esc** releases it), or drag with the left mouse button |
| Restart / change dog | Click **Back to start** in the game HUD |

## Run locally

Serve the repository root with any static file server, then open the URL in a
desktop browser. For example:

```sh
python3 -m http.server 8000
```

or:

```sh
npx serve .
```

Then visit <http://localhost:8000>. Use a modern desktop browser (Chrome,
Edge, Firefox, Safari) — the game uses ES modules and import maps, so opening
`index.html` directly from disk will not work; it must be served over HTTP.

## Deploy to GitHub Pages

The site deploys via the GitHub Actions workflow in
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which
publishes `index.html`, `js/` and `css/` on every push to `master` (and on
manual dispatch).

One-time setup by the repository owner:

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Run the workflow once (push to `master`, or **Actions → Deploy to GitHub
   Pages → Run workflow**).

The game is then live at <https://sigurs.github.io/super-action-doggo/>.

## How it is built

- No build step: plain HTML, CSS and ES modules, exactly as committed.
- Three.js is pinned to an exact version (`0.186.1`) via an import map in
  `index.html`, loaded from jsDelivr. No npm packages, no vendored libraries.
- All dog models are parameterized assemblies of flat-shaded Three.js
  primitives (`js/dog-builder.js`) — no external 3D assets.
- All local asset references are relative paths, so the site works under the
  GitHub Pages repository subpath.
