import { html } from "html"
import Element from "./element.js"

function isModifiedClick(e) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0
}

export default class Button extends Element {
  static css = new URL(`./button.css`, import.meta.url)

  static get observedAttributes() {
    return [
      "disabled",
      "href",
      "primary",
      "secondary",
      "danger",
      "target",
      "rel",
    ]
  }

  constructor() {
    super()
    this.dest = undefined // property set via .dest=${...}
  }

  get disabled() {
    return this.hasAttribute("disabled")
  }

  _variant() {
    if (this.hasAttribute("danger")) return "danger"
    if (this.hasAttribute("secondary")) return "secondary"
    if (this.hasAttribute("primary")) return "primary"
    return "primary"
  }

  _mode() {
    // precedence: dest > href > button
    if (this.dest) return "internal-link"
    const href = this.getAttribute("href")
    if (href) return "external-link"
    return "button"
  }

  _internalHref() {
    // dest -> absolute path
    return url(this.dest)
  }

  // --- event handlers ---
  _onInternalLinkClick(e) {
    // Let native behaviors happen (new tab/window, copy link, etc.)
    if (this.disabled) {
      e.preventDefault()
      e.stopImmediatePropagation()
      return
    }

    // If user code already prevented, respect it
    if (e.defaultPrevented) return

    // If user is doing ctrl+click/middle-click, don't hijack: keep native affordances
    if (isModifiedClick(e)) return

    // Normal click: SPA navigation
    e.preventDefault()

    page.value = this.dest
  }

  render() {
    const mode = this._mode()
    const variant = this._variant()
    const disabled = this.disabled

    // Shared class hook for styling in x-button.css
    const cls = `control ${variant} ${disabled ? "is-disabled" : ""}`

    if (mode === "internal-link") {
      const href = this._internalHref()

      // When disabled, we *must not* include href (so it won’t navigate)
      // but we can keep it in data-href for debugging / menus if you want.
      const effectiveHref = disabled ? null : href

      return html`
        <a
          class=${cls}
          href=${effectiveHref ?? ""}
          ?data-disabled=${disabled}
          aria-disabled=${disabled ? "true" : "false"}
          tabindex=${disabled ? "-1" : "0"}
          @click=${(e) => this._onInternalLinkClick(e)}
        >
          <slot></slot>
        </a>
      `
    }

    if (mode === "external-link") {
      const href = this.getAttribute("href")
      const target = this.getAttribute("target") || null
      const rel =
        this.getAttribute("rel") || (target === "_blank" ? "noopener" : null)

      // Disabled external link: same pattern as internal
      const effectiveHref = disabled ? null : href

      return html`
        <a
          class=${cls}
          href=${effectiveHref ?? ""}
          target=${target ?? ""}
          rel=${rel ?? ""}
          aria-disabled=${disabled ? "true" : "false"}
          tabindex=${disabled ? "-1" : "0"}
          @click=${(e) => {
            if (disabled) {
              e.preventDefault()
              e.stopImmediatePropagation()
            }
          }}
        >
          <slot></slot>
        </a>
      `
    }

    // button mode
    return html`
      <button class=${cls} type="button" ?disabled=${disabled}>
        <slot></slot>
      </button>
    `
  }
}

customElements.define("x-button", Button)
