# KZ Graphix replica — personalized hero

The live design follows the original Canva replica (version 2), with only its hero character personalized from the user-provided photo.

The hero is a static comic illustration, served as a local poster and still-image video to preserve the existing renderer. Original animated character playback is replaced. Other portfolio content retains the reference identity and assets.

Generated asset: `/workspace/sites/kzgraphix-replica/dist/assets/shawon-hero.png`.
Built-in imagegen edit used the original hero as composition reference and the supplied user portrait as identity reference. Prompt: replace only the central character identity, preserving the glasses, hair, face structure and short beard, and retain the original pose, comic linework, navy shirt, white trousers, text and background layout.

The rejected 3D design remains archived in `reference/3d-redesign/`; the earlier replica is in `reference/canva-export/`.

Validation: generated hero visually inspected, local paths and JavaScript syntax checked, still-image video encoded successfully. Browser visual QA unavailable.

## Complete character update
All 17 identified decorative-character raster variants (36 catalog references) now point to personalized assets, including standing, walking, crouching and the GUAVIDA composition. The graphic-shirt pose uses the generated plain navy-shirt standing character because image generation for that specific pose was blocked. Original artwork actors and unrelated portfolio photographs remain unchanged.

Hero is now a genuine 12-second / 360-frame 30fps animation, composited from separately generated background, character and foreground-decoration layers. Character sways, left/right decoration groups drift independently, and the heading backdrop subtly moves. This is a recreated layered animation, not the original video's exact motion. Served locally with inline muted autoplay and looping.

Built-in imagegen was used to create all replacement raster artwork. Project files and original prompts/intent: `source-assets/personalized/`; generated identity edits preserve the uploaded portrait's glasses, upswept black hair, skin tone, short beard and face proportions, while retaining the pose reference's clothing and illustration style. Full image-variant mapping: `replacement-audit.json`. The animation filter graph is `animate-hero.ffmpeg`.

Verified output dimensions/duration/frame count, inspected frames at different times, checked JavaScript syntax and absence of original character image URLs. Browser visual QA remains unavailable.

## CV-based portfolio — October 2026
The active page is now `dist/index.html`, `dist/portfolio.css`, and `dist/portfolio.js`.
Content follows Shawon Khan's supplied CV: six work-history roles, technical skills,
education, languages, quantified impact, interests and contact details. Prior graphics
work belonging to the reference portfolio is no longer presented as Shawon's work.
The original personalized comic character is reused with independently animated type,
web lines and stickers, a pause button and reduced-motion support. Spider-Verse-inspired
halftones and red/blue comic panels inform the lower sections. Assets and CV download
are served locally; the active page has no Canva runtime dependency.
Previous native replica HTML is preserved in `reference/pre-cv/index.html`.
Validation: JavaScript syntax, HTML parsing, local asset paths and anchor targets.
Browser visual QA unavailable in the managed container; responsive CSS is unverified
in a real browser.

## Active publication: photo-referenced Spidey hero
The rejected full-page CV redesign was rolled back. This update starts from
`reference/pre-cv/index.html` and replaces ONLY native hero PBfnH8xQHSwbKvCy.
All nine remaining first-page sections and the complete second page are unchanged.
The new isolated hero lives in `dist/hero.html`, `hero.css`, and `hero.js`.
Two locally served imagegen layers use the newly supplied portrait as identity reference:
`dist/assets/spidey-hero/character.png` (alpha character) and `city.png` (background).
Character position/rotation, fist-attached SVG webs, floating tech icons and skyline
parallax animate independently using requestAnimationFrame. Includes pause/resume,
reduced-motion support and offscreen/background-tab suspension. The face is an AI
comic interpretation of the supplied portrait, not a pixel-identical photo composite.
No anatomical skeletal rigging: animation is layered 2.5D motion.
Validation: JS syntax, HTML/local assets/CSS, preserved native section data comparison.
Managed browser QA unavailable; no browser-rendered visual verification performed.

## Hero fullscreen / hand correction
Simplified hero to the sole tagline “Your Friendly Neighborhood IT Guy”. Removed
name, navigation, CTA buttons, all tech icons and extra labels. Locally served italic
comic display lettering uses navy outlines and red/blue offset shadows. Icon-only
accessible motion toggle remains. Iframe follows visualViewport height (ignoring
pinch zoom), and character size/placement is bounded by both viewport dimensions.
New imagegen asset `character-webshoot.png` changes the fist into the middle/ring-
fingers-folded web-shooting gesture; source image supplies face/body continuity.
Web origin follows the underside of the wrist at image-normalized (0.853, 0.297).
Validated full character bounds with motion margins across eight desktop/mobile
viewport sizes, visible-text scope and JavaScript syntax. Browser QA unavailable.

## Restored side swing and reference hand
Character now uses the user-selected image as edit target with the red-circled side-view
hand reference. Asset: `character-side-hand.png`. Entrance starts 75% viewport width
outside the settled pose, with an 18-degree rotation and a curved 1.8-second arrival.
Playback waits for character load; reduced-motion skips the entrance. Settled layout
and tagline unchanged. Only hero assets/code and its cache version changed; native
portfolio content is untouched. Browser rendering remains unverified.


### Restore access to the replica beneath the hero
The native Canva stylesheet sets body overflow:hidden. With the separate hero before #root, that trapped the unchanged replica below the viewport. Override the outer document to scroll and retain a viewport-sized native root so its original internal scrolling and section behavior remain intact. No hero assets or replica content changed. Browser QA unavailable in this managed session; verified CSS precedence and exact preservation of all markup/bootstrap outside the added CSS.
