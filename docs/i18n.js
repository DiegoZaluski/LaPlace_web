// i18n 🌐
class I18n {
  //😵‍💫//
  //--------------------------------------------------------------------------->
  constructor() {
    let detectedLocale =
      localStorage.getItem("userLanguage") ||
      (navigator.languages && navigator.languages[0]) || // 1.localStorage, 2.navigator.languages, preferred 3.default -> en
      "en";

    // Extract base locale (pt-BR → pt, en-US → en)
    this.locale = detectedLocale.split("-")[0] || "en";
    //(navigator.languages && navigator.languages[0]) ? avoid errors in old browsers
    this.translations = {};
    this.fallbackLocale = "en";
    this.loadTranslations();
    this.copy;
    //-----------------------------------------------------------------------------------☕
    window.addEventListener("storage", (e) => {
      if (e.key === "userLanguage" && e.newValue !== this.locale) {
        this.changeLanguage(e.newValue);
      }
    });
  }
  //-----------------------------------------------------------------------------------☕
  look() {
    // review ➕➕
    if (!this.translations || !this.translations.models)
      return console.warn("this.translations: not found:", this.translations);
    //
    if (this.copy !== this.locale) {
      try {
        const event = new CustomEvent("i18n:ready", {
          detail: {
            models: Array.isArray(this.translations.models)
              ? this.translations.models
              : [],
            locale: this.locale,
          },
          bubbles: true,
          cancelable: true,
        }); //➕➕🫨

        this.copy = this.locale;
        const hasListeners =
          document.getEventListeners &&
          typeof document.getEventListeners === "function" &&
          document.getEventListeners("i18n:ready").length > 0; //🫨
        // debugger^^^
        if (!hasListeners) {
          console.warn("[i18n] No listeners registered for event i18n:ready");
        }
        document.dispatchEvent(event);
      } catch (error) {
        console.error("[i18n] Err dispatching event i18n:ready:", error);
      }
    }
  }
  //get translations from json file
  async loadTranslations() {
    try {
      // requests
      const [authResponse, modelsResponse] = await Promise.all([
        fetch(`locales/${this.locale}/auth.json`).catch((err) => {
          console.error(`[i18n] Err loading auth.json:`, err);
          throw err;
        }),
        fetch(`locales/${this.locale}/inf.json`).catch((err) => {
          console.error(`[i18n] Err loading inf.json:`, err);
          throw err;
        }),
      ]);
      //authentication ok
      if (!authResponse.ok) {
        throw new Error(`[i18n] Err loading auth.json: ${authResponse.status}`);
      }
      if (!modelsResponse.ok) {
        throw new Error(
          `[i18n] Err loading inf.json: ${modelsResponse.status}`,
        );
      }

      let auth, models;
      try {
        [auth, models] = await Promise.all([
          authResponse.json(),
          modelsResponse.json(),
        ]);
      } catch (jsonError) {
        console.error(`[i18n] Err conversion:JSON:`, jsonError);
        throw new Error(`[i18n] Err processing translation files`);
      }
      //

      if (!Array.isArray(models)) {
        throw new Error(`[i18n] Format inf.json invalid`);
      }

      this.translations = {
        ...(auth || {}),
        models: models,
      }; // join models ➕ auth
      this.look();
      this.updatePage();
    } catch (error) {
      console.warn(
        `[i18n] Err loading ${this.locale}, trying ${this.fallbackLocale}...`,
        error,
      );
      if (this.locale !== this.fallbackLocale) {
        //---------------------------------------------------->
        const originalLocale = this.locale;
        this.locale = this.fallbackLocale;
        try {
          // fallback
          await this.loadTranslations();
        } finally {
          this.locale = originalLocale;
        } // 🫂
      }
    }
  }
  //🦖🐉🦕---------------------------------------------------------------> hello world
  t(key, params = {}) {
    let translation =
      key
        .split(".")
        .reduce(
          (obj, k) => (obj && obj[k] !== undefined ? obj[k] : null),
          this.translations,
        ) || key; //➕➕➕🕹️
    if (typeof translation === "object") {
      return translation;
    }
    Object.keys(params).forEach((param) => {
      translation = translation.replace(
        new RegExp(`{{${param}}}`, "g"),
        params[param],
      ); //sub:occurrences
    });
    return translation;
  }

  changeLanguage(locale) {
    if (this.locale !== locale) {
      this.locale = locale;
      localStorage.setItem("userLanguage", locale);
      this.loadTranslations();
    }
  }

  updatePage() {
    // look for elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const translation = this.t(key);
      if (element.placeholder !== undefined) {
        element.placeholder = translation;
      } else if (
        element.value &&
        (element.tagName === "INPUT" || element.tagName === "TEXTAREA")
      ) {
        element.value = translation;
      } else if (element.hasAttribute("data-i18n-html")) {
        element.innerHTML = DOMPurify.sanitize(translation);
      } else {
        element.textContent = translation;
      }
      element.getAttributeNames().forEach((attr) => {
        if (attr.startsWith("data-i18n-") && attr !== "data-i18n") {
          const attrName = attr.replace("data-i18n-", ""); //remove data-i18n prefix: title
          element.setAttribute(attrName, this.t(element.getAttribute(attr)));
        }
      });
    });
  }
  //number
  formatDate(data, options = {}) {
    if (typeof data === "string") {
      data = new Date(data);
    }
    if (!(data instanceof Date) || isNaN(data)) {
      console.warn("[i18n] Err format date"); // warn an error not critical, does not interrupt the code
      return String(data); // returns the date as string
    }

    try {
      return new Intl.DateTimeFormat(this.locale, options).format(data);
    } catch (Err) {
      console.error("Err", Err);
      return data.toLocaleString(); // returns the date as string but not formatted
    }
  }

  formatNumber(number, options = {}) {
    // format number
    const num = Number(number);
    if (isNaN(num)) {
      console.warn("[i18n] Err format number");
      return String(number); // returns the number as string
    }

    try {
      return new Intl.NumberFormat(this.locale, options).format(number);
    } catch (Err) {
      console.error("[i18n] Err format number", Err);
      return String(number);
    }
  }
} // ➕➕➕
window.i18n = new I18n();
/*
┌───────────────────────────┐
│ I18n.constructor()        │
│ - set locale              │
│ - set fallbackLocale      │
│ - loadTranslations()      │
│ - add storage listener    │
└────────────┬──────────────┘
             │
             ▼
┌───────────────────────────┐
│ loadTranslations()        │
│ - fetch auth.json &       │
│   models.json             │
│ - parse JSON              │
│ - merge auth + models     │
│ - fallback if error       │
└────────────┬──────────────┘
             │
             ▼
┌───────────────────────────┐
│ look()                    │
│ - check if translations   │
│ - create CustomEvent      │
│ - dispatch 'i18n:ready'   │
│ - verify listeners        │
└────────────┬──────────────┘
             │
             ▼
┌───────────────────────────┐
│ updatePage()              │
│ - find [data-i18n]        │
│ - apply translations      │
│ - update attributes       │
└────────────┬──────────────┘
             │
             ▼
┌───────────────────────────┐
│ t(key, params)            │
│ - fetch translation       │
│ - replace {{params}}      │
└───────────────────────────┘
*/
