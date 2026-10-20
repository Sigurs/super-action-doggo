# Super Action Doggo

This project is meant as a companion - or a test - project for my own agentic development system.  
I want to flesh out it's capabilities and this will suit that purpose fine.  

Super Action Doggo is a cozy low-poly 3D browser game about being the best
dog in the park. It is built with [Three.js](https://threejs.org/) loaded from
a CDN, ships as a no-build static site, and needs nothing but a plain static
file server. This is Phase 1: a living dog park — wander it with your dog,
meet the NPC dogs that roam and sniff around, greet them with **E**, get
petted by strolling visitors (or startle them with a bark), play fetch by
throwing a ball with the mouse and bringing it back, and watch the day fade
into night and back. Keep an eye on the mood and energy meters: running and
jumping tire the dog out, and an exhausted dog walks until it rests, while
fetch, greetings and petting keep its mood up.

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
| Bark | **B** (nearby visitors react) |
| Throw the ball | Hold the **left mouse button** to charge, release to throw where you aim — hold longer to throw farther. Only one ball is in play: throwing again replaces it. Steer your dog over the resting ball to pick it up, then guide it back near where you threw from to drop it for another round |
| Greet an NPC dog | **E** when the "Press E to greet" prompt shows (mood rises; each neighbor needs a pause before it counts again) |
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
  primitives (`js/dog-builder.js`) — no external 3D assets. The same builder
  makes the NPC dogs; human visitors are box-and-limb figures
  (`js/visitors.js`).
- The park feels alive: NPC dogs wander on their own (`js/npc-dogs.js`),
  visitors stroll, sit on benches and react to your dog, and a day/night
  cycle drives the lights, sky and fog (`js/day-night.js`) over roughly four
  real minutes per loop.
- All local asset references are relative paths, so the site works under the
  GitHub Pages repository subpath.
