(() => {
  "use strict";

  const api = typeof browser !== "undefined" ? browser : chrome;
  const SITE_SCOPE_KEY = "siteScope";
  const ALL_SITE_MATCHES = ["http://*/*", "https://*/*"];
  const options = document.getElementById("scope-options");
  const status = document.getElementById("status");
  const radios = [...document.querySelectorAll('input[name="scope"]')];
  let currentScope = "wayground";

  function setStatus(message, error = false) {
    status.textContent = message;
    status.dataset.state = error ? "error" : "ok";
  }

  function showSelection(scope) {
    for (const radio of radios) radio.checked = radio.value === scope;
  }

  async function loadScope() {
    try {
      const saved = await api.storage.local.get({ [SITE_SCOPE_KEY]: "wayground" });
      const hasAllAccess = await api.permissions.contains({ origins: ALL_SITE_MATCHES });
      currentScope = saved[SITE_SCOPE_KEY] === "all" && hasAllAccess ? "all" : "wayground";
      showSelection(currentScope);
      setStatus("Pengaturan siap. Pilihan disimpan otomatis.");
      options.disabled = false;
    } catch (error) {
      setStatus("Tidak bisa membaca pengaturan: " + String(error), true);
    }
  }

  async function changeScope(event) {
    const nextScope = event.target.value;
    if (nextScope === currentScope) return;

    options.disabled = true;
    setStatus("Menerapkan pilihan…");
    try {
      // Permission prompts must originate from a direct user interaction.
      if (nextScope === "all") {
        const granted = await api.permissions.request({ origins: ALL_SITE_MATCHES });
        if (!granted) throw new Error("Izin akses semua situs tidak diberikan.");
      }

      await api.storage.local.set({ [SITE_SCOPE_KEY]: nextScope });
      const result = await api.runtime.sendMessage({ type: "WAYGROUND_SYNC_SCOPE" });
      if (!result || !result.ok) {
        throw new Error(result && result.error ? result.error : "Gagal memperbarui cakupan.");
      }

      currentScope = nextScope;
      // Drop optional broad access when it is no longer needed.
      if (nextScope === "wayground") {
        try {
          await api.permissions.remove({ origins: ALL_SITE_MATCHES });
        } catch (error) {
          console.warn("Optional site access could not be removed:", error);
        }
      }
      setStatus("Tersimpan! Muat ulang tab untuk menerapkan perubahan.");
    } catch (error) {
      try {
        await api.storage.local.set({ [SITE_SCOPE_KEY]: currentScope });
      } catch (_) {}
      showSelection(currentScope);
      setStatus(String(error), true);
    } finally {
      options.disabled = false;
    }
  }

  for (const radio of radios) radio.addEventListener("change", changeScope);
  void loadScope();
})();
