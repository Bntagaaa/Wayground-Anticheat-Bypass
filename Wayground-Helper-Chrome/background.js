/* Scope-aware registration. Kept in the extension background context. */
(() => {
  "use strict";

  const api = typeof browser !== "undefined" ? browser : chrome;
  const SCRIPT_ID = "wayground-helper-controlled";
  const SITE_SCOPE_KEY = "siteScope";
  const WAYGROUND_MATCHES = ["*://wayground.com/*", "*://*.wayground.com/*"];
  const ALL_SITE_MATCHES = ["http://*/*", "https://*/*"];
  let pending = Promise.resolve();

  function sameMatches(actual, expected) {
    return Array.isArray(actual) &&
      JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
  }

  async function syncContentScript() {
    const saved = await api.storage.local.get({ [SITE_SCOPE_KEY]: "wayground" });
    const wantsAll = saved[SITE_SCOPE_KEY] === "all";
    const hasAllAccess = await api.permissions.contains({ origins: ALL_SITE_MATCHES });
    const useAll = wantsAll && hasAllAccess;
    const matches = useAll ? ALL_SITE_MATCHES : WAYGROUND_MATCHES;

    // A revoked permission must never leave an "all sites" preference active.
    if (wantsAll && !hasAllAccess) {
      await api.storage.local.set({ [SITE_SCOPE_KEY]: "wayground" });
    }

    const registered = await api.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    const previous = registered[0];
    if (previous &&
        sameMatches(previous.matches, matches) &&
        previous.world === "MAIN" &&
        previous.runAt === "document_start") {
      return;
    }

    if (previous) {
      await api.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
    }
    await api.scripting.registerContentScripts([{
      id: SCRIPT_ID,
      js: ["content.js"],
      matches,
      runAt: "document_start",
      allFrames: true,
      matchAboutBlank: true,
      world: "MAIN",
      persistAcrossSessions: true
    }]);
  }

  function queueSync() {
    const result = pending.then(syncContentScript, syncContentScript);
    pending = result.catch((error) => {
      console.error("Wayground Helper: scope registration failed", error);
    });
    return result;
  }

  api.runtime.onInstalled.addListener(() => { void queueSync(); });
  api.runtime.onStartup.addListener(() => { void queueSync(); });
  api.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[SITE_SCOPE_KEY]) void queueSync();
  });
  api.permissions.onAdded.addListener(() => { void queueSync(); });
  api.permissions.onRemoved.addListener(() => { void queueSync(); });

  api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || message.type !== "WAYGROUND_SYNC_SCOPE") return false;
    queueSync().then(
      () => sendResponse({ ok: true }),
      (error) => sendResponse({ ok: false, error: String(error) })
    );
    return true;
  });

  // Covers event-page/service-worker wakeups as well as first-run initialization.
  void queueSync();
})();
