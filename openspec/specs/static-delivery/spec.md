# static-delivery Specification

## Purpose
Delivers Super Action Doggo as a no-build static web site that a plain file server or GitHub Pages can serve exactly as committed, with a README explaining the game.

## Requirements

### Requirement: The game is a no-build static site
The game SHALL consist only of static files (HTML, JavaScript and CSS) that a browser executes directly, with no bundling, transpilation or package installation step between committing files and serving them.

#### Scenario: Serving the committed files runs the game
- **WHEN** the committed site files are served by any plain static file server and the entry page is opened in a desktop browser
- **THEN** the game loads and is playable (start screen with dog selection through to the playing scene), with no build artifacts or generated files required

### Requirement: The 3D library loads from a pinned CDN source
The 3D rendering library SHALL be loaded from a public CDN at a pinned exact version through an import map, and the repository SHALL NOT vendor the library or require a package manager to obtain it.

#### Scenario: Library loads on page open
- **WHEN** the entry page is opened in a browser with normal network access
- **THEN** the 3D library is fetched from its pinned CDN URL and the 3D scene renders

#### Scenario: Version stays stable across reloads
- **WHEN** the page is reloaded or the site is redeployed without file changes
- **THEN** the same pinned library version is loaded, so rendering behavior does not drift

### Requirement: The site works at its GitHub Pages URL
The site SHALL be fully functional when served by GitHub Pages, including when Pages hosts it under a repository subpath rather than a domain root, and SHALL reference its own local assets with relative paths only.

#### Scenario: Playing the deployed game
- **WHEN** a player opens the repository's GitHub Pages URL in a desktop browser
- **THEN** the game loads without missing modules, styles or other assets, and is playable

#### Scenario: Site assets use relative paths
- **WHEN** the entry page's HTML, scripts and styles are inspected
- **THEN** every reference to a repository-local asset is a relative path, with no absolute site paths that would break under a repository subpath

### Requirement: The README describes the game and how to run it
The README SHALL briefly describe Super Action Doggo, its controls, how to run it locally with a static file server, and how it is deployed to GitHub Pages.

#### Scenario: A newcomer follows the README
- **WHEN** a reader follows the README's local-run instructions on a clone of the repository
- **THEN** they can serve and play the game without asking for further setup details
