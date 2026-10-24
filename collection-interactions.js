/**
 * CORNESS - Real interactive collection cards.
 * Card hover reveals an action; clicking / Enter / Space opens a working detail dialog.
 * The coaster uses the existing page's interactive 3D viewer.
 * No backend, fake purchase action, or fake 3D model is introduced.
 */
(() => {
  'use strict';
  const collection = document.getElementById('corness-heritage-collection');
  if (!collection) return;
  const cards = [...collection.querySelectorAll('[data-corness-artifact]')];
  if (cards.length !== 3) return;

  const extra = {
    coaster: {
      origin: 'Xuan Phu, Dong Nai',
      material: '86 g of reclaimed corn cobs',
      process: 'Pressed composite with heritage-inspired motifs',
      note: 'The existing 3D model on this page can be rotated and flipped to explore the coaster from both sides.',
      actionLabel: 'Explore Coaster in 3D', actionType: '3d'
    },
    journal: {
      origin: 'CORNESS Workshop #02',
      material: '120 g of corn-fiber paper',
      process: 'Unbleached paper and hand-sewn hemp-thread binding',
      note: 'This archived creation is displayed as part of Minh’s collection. Explore the workshops to learn more about handmade upcycled craft.',
      actionLabel: 'Explore Workshops', actionHref: 'experience.html'
    },
    lamp: {
      origin: 'Limited bespoke edition',
      material: 'Layered corn-husk membranes',
      process: 'Hand-layered translucent lampshade',
      note: 'The collection currently shows this lamp as in production (80%). This is the saved collection status, not a live production feed.',
      actionLabel: 'Explore the Shop', actionHref: 'shop.html'
    }
  };

  const backdrop = document.createElement('div');
  backdrop.id = 'corness-collection-lightbox';
  backdrop.hidden = true;
  backdrop.innerHTML = `
    <section class="cc-dialog" role="dialog" aria-modal="true" aria-labelledby="cc-dialog-title" aria-describedby="cc-dialog-description">
      <button class="cc-dialog-close" type="button" aria-label="Close artifact details" title="Close">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
      <div class="cc-dialog-media"><img id="cc-dialog-img" alt="" /></div>
      <div class="cc-dialog-body">
        <p class="cc-dialog-eyebrow" id="cc-dialog-kicker"></p>
        <h2 class="cc-dialog-title" id="cc-dialog-title"></h2>
        <p class="cc-dialog-description" id="cc-dialog-description"></p>
        <div class="cc-facts">
          <div class="cc-fact"><span class="cc-fact-label">Artifact ID</span><span class="cc-fact-value" id="cc-dialog-id"></span></div>
          <div class="cc-fact"><span class="cc-fact-label">Collection status</span><span class="cc-fact-value" id="cc-dialog-status"></span></div>
          <div class="cc-fact"><span class="cc-fact-label">Material</span><span class="cc-fact-value" id="cc-dialog-material"></span></div>
          <div class="cc-fact"><span class="cc-fact-label">Origin / Edition</span><span class="cc-fact-value" id="cc-dialog-origin"></span></div>
        </div>
        <p class="cc-dialog-notes" id="cc-dialog-process"></p>
        <p class="cc-dialog-notes" id="cc-dialog-note"></p>
        <a class="cc-dialog-cta" id="cc-dialog-cta" href="experience.html">
          <span id="cc-dialog-cta-label">Explore Workshops</span>
          <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </a>
        <div class="cc-dialog-nav" aria-label="Browse artifacts">
          <button class="cc-nav-button" type="button" id="cc-dialog-prev" aria-label="Previous artifact">
            <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span> Previous
          </button>
          <span class="cc-dialog-eyebrow" id="cc-dialog-count" aria-live="polite"></span>
          <button class="cc-nav-button" type="button" id="cc-dialog-next" aria-label="Next artifact">
            Next <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>`;
  document.body.appendChild(backdrop);
  const dialog = backdrop.querySelector('.cc-dialog');
  const closeButton = backdrop.querySelector('.cc-dialog-close');
  const primary = backdrop.querySelector('#cc-dialog-cta');
  let activeIndex = 0;
  let lastFocused = null;

  const setText = (id, value) => {
    const node = backdrop.querySelector(`#${id}`);
    if (node) node.textContent = value || '';
  };
  const updateDetails = (index) => {
    activeIndex = (index + cards.length) % cards.length;
    const card = cards[activeIndex];
    const data = extra[card.dataset.cornessArtifact];
    if (!data) return;
    const photo = card.querySelector('.corness-collection-visual img');
    const tag = card.querySelector('.space-y-1\\.5 > span');
    const title = card.querySelector('h3');
    const description = card.querySelector('.space-y-1\\.5 > p');
    const status = card.querySelector('.border-t strong');
    const id = card.querySelector('.border-t > span:last-child');
    const largePhoto = backdrop.querySelector('#cc-dialog-img');
    if (photo && largePhoto) {
      largePhoto.src = photo.currentSrc || photo.src;
      largePhoto.alt = photo.alt || (title?.textContent.trim() || 'CORNESS artifact');
    }
    setText('cc-dialog-kicker', tag?.textContent.trim());
    setText('cc-dialog-title', title?.textContent.trim());
    setText('cc-dialog-description', description?.textContent.trim());
    setText('cc-dialog-id', id?.textContent.trim());
    setText('cc-dialog-status', status?.textContent.trim());
    setText('cc-dialog-material', data.material);
    setText('cc-dialog-origin', data.origin);
    setText('cc-dialog-process', data.process);
    setText('cc-dialog-note', data.note);
    setText('cc-dialog-count', `${activeIndex + 1} / ${cards.length}`);
    setText('cc-dialog-cta-label', data.actionLabel);
    primary.href = data.actionType === '3d' ? '#corness-3d-viewer' : data.actionHref;
    primary.dataset.action = data.actionType || 'link';
    dialog.scrollTop = 0;
  };

  function openDetails(index) {
    lastFocused = document.activeElement;
    updateDetails(index);
    backdrop.hidden = false;
    document.body.classList.add('corness-collection-dialog-open');
    closeButton.focus();
  }
  function closeDetails() {
    if (backdrop.hidden) return;
    backdrop.hidden = true;
    document.body.classList.remove('corness-collection-dialog-open');
    if (lastFocused && lastFocused.isConnected && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  }
  cards.forEach((card, index) => {
    card.addEventListener('click', () => openDetails(index));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDetails(index);
      }
    });
  });
  closeButton.addEventListener('click', closeDetails);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeDetails();
  });
  backdrop.querySelector('#cc-dialog-prev').addEventListener('click', () => updateDetails(activeIndex - 1));
  backdrop.querySelector('#cc-dialog-next').addEventListener('click', () => updateDetails(activeIndex + 1));
  primary.addEventListener('click', (event) => {
    if (primary.dataset.action !== '3d') return;
    event.preventDefault();
    closeDetails();
    const viewer = document.getElementById('threejs-container-ANIMATION_260');
    if (viewer) {
      viewer.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (typeof window.cornessDesktopReset === 'function') window.cornessDesktopReset();
    } else {
      // Actual viewer is not loaded: use the on-page product details instead.
      document.getElementById('artifact-passport')?.scrollIntoView({behavior:'smooth'});
    }
  });
  document.addEventListener('keydown', (event) => {
    if (backdrop.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDetails();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      updateDetails(activeIndex + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      updateDetails(activeIndex - 1);
    } else if (event.key === 'Tab') {
      const focusables = [...dialog.querySelectorAll('button:not([disabled]),a[href]')];
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
})();
