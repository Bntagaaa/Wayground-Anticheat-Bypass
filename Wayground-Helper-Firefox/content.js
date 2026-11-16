/*
 * Activity Privacy Controls & Unrestricted Selection
 *
 * Fitur:
 * - Spoofing Page Visibility (tab selalu aktif & fokus)
 * - Spoofing Fullscreen API & resolusi viewport
 * - Mencegat event pelacak (blur, resize, fullscreenchange)
 * - Membuka kunci seleksi teks (CSS user-select, selectstart, mousedown)
 * - Membuka kunci copy, cut, paste, dan klik kanan
 */
(() => {
  "use strict";

  // 1. Injeksi CSS agresif agar semua elemen (termasuk tombol & span) bisa di-blok
  const injectForceSelectCSS = () => {
    const style = document.createElement("style");
    style.id = "force-select-style";
    style.textContent = `
    *, *::before, *::after, button, [role="button"], input, textarea {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
      pointer-events: auto !important;
    }
    `;
    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(style);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        (document.head || document.documentElement).appendChild(style);
      });
    }
  };
  injectForceSelectCSS();

  // 2. Fungsi pencegat listener halaman
  const stopPageListeners = (type) => {
    window.addEventListener(
      type,
      (event) => {
        // Hentikan eksekusi script pelacak milik situs web
        event.stopImmediatePropagation();
      },
      true
    );
  };

  // 3. Tab switching & Focus Spoofing (selalu terlihat aktif)
  try {
    Object.defineProperty(Document.prototype, "hidden", {
      configurable: true,
      get: () => false
    });
  } catch (_) {}

  try {
    Object.defineProperty(Document.prototype, "visibilityState", {
      configurable: true,
      get: () => "visible"
    });
  } catch (_) {}

  try {
    Document.prototype.hasFocus = function () {
      return true;
    };
  } catch (_) {}

  // 4. Fullscreen Spoofing (selalu terdeteksi fullscreen)
  const fullscreenElementDescriptor = {
    configurable: true,
    get: function () {
      return document.documentElement;
    }
  };

  try {
    Object.defineProperty(Document.prototype, "fullscreenElement", fullscreenElementDescriptor);
    Object.defineProperty(Document.prototype, "webkitFullscreenElement", fullscreenElementDescriptor);
    Object.defineProperty(Document.prototype, "mozFullScreenElement", fullscreenElementDescriptor);
    Object.defineProperty(Document.prototype, "msFullscreenElement", fullscreenElementDescriptor);
  } catch (_) {}

  const fullscreenEnabledDescriptor = {
    configurable: true,
    get: () => true
  };

  try {
    Object.defineProperty(Document.prototype, "fullscreenEnabled", fullscreenEnabledDescriptor);
    Object.defineProperty(Document.prototype, "webkitFullscreenEnabled", fullscreenEnabledDescriptor);
    Object.defineProperty(Document.prototype, "mozFullScreenEnabled", fullscreenEnabledDescriptor);
    Object.defineProperty(Document.prototype, "msFullscreenEnabled", fullscreenEnabledDescriptor);
  } catch (_) {}

  // Menyamakan outer dimension dengan screen untuk mengelabui deteksi viewport
  try {
    Object.defineProperty(window, "outerHeight", {
      configurable: true,
      get: () => window.screen.height
    });
    Object.defineProperty(window, "outerWidth", {
      configurable: true,
      get: () => window.screen.width
    });
  } catch (_) {}

  // 5. Daftar event pelacak dan pengunci interaksi yang dicegat
  [
    // Pelacak perpindahan layar/tab
    "visibilitychange",
    "webkitvisibilitychange",
    "blur",
    "pagehide",

    // Pelacak fullscreen
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "MSFullscreenChange",

    // Pelacak resize window
    "resize",

    // Pengunci clipboard & konteks menu
    "copy",
    "cut",
    "paste",
    "contextmenu",

    // Pengunci seleksi teks mouse
    "selectstart",
    "dragstart"
  ].forEach(stopPageListeners);

  // Izinkan mousedown agar event seleksi di dalam tombol tidak dibatalkan preventDefault()
  window.addEventListener(
    "mousedown",
    (event) => {
      event.stopPropagation();
    },
    true
  );
})();
