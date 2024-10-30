/*!
 * Bootstrap JavaScript
 */

(function (t, e) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = e();
    } else if (typeof define === "function" && define.amd) {
        define(e);
    } else {
        (t = typeof globalThis !== "undefined" ? globalThis : t || self).bootstrap = e();
    }
}(this, (function () {
    "use strict";

    const instanceMap = new Map();
    const instanceManager = {
        set(element, instanceName, instance) {
            if (!instanceMap.has(element)) {
                instanceMap.set(element, new Map());
            }
            const instanceMapForElement = instanceMap.get(element);
            if (!instanceMapForElement.has(instanceName) || instanceMapForElement.size === 0) {
                instanceMapForElement.set(instanceName, instance);
            } else {
                console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMapForElement.keys())[0]}.`);
            }
        },
        get: (element, instanceName) => instanceMap.has(element) && instanceMap.get(element).get(instanceName) || null,
        remove(element, instanceName) {
            if (!instanceMap.has(element)) return;
            const instanceMapForElement = instanceMap.get(element);
            instanceMapForElement.delete(instanceName);
            if (instanceMapForElement.size === 0) {
                instanceMap.delete(element);
            }
        }
    };

    const transitionEndEvent = "transitionend";

    const escapeSelector = (selector) => {
        if (selector && window.CSS && window.CSS.escape) {
            selector = selector.replace(/#([^\s"#']+)/g, (match, group) => `#${CSS.escape(group)}`);
        }
        return selector;
    };

    const dispatchTransitionEnd = (element) => {
        element.dispatchEvent(new Event(transitionEndEvent));
    };

    const isElement = (element) => {
        return element && typeof element === "object" && (element.jquery ? element[0] : element.nodeType);
    };

    const getElement = (selector) => {
        if (isElement(selector)) {
            return selector.jquery ? selector[0] : selector;
        }
        if (typeof selector === "string" && selector.length > 0) {
            return document.querySelector(escapeSelector(selector));
        }
        return null;
    };

    const isVisible = (element) => {
        if (!isElement(element) || element.getClientRects().length === 0) return false;
        const visibility = getComputedStyle(element).getPropertyValue("visibility");
        const closestDetails = element.closest("details:not([open])");
        if (!closestDetails) return visibility === "visible";

        if (closestDetails !== element) {
            const closestSummary = element.closest("summary");
            if (closestSummary && closestSummary.parentNode !== closestDetails) return false;
            if (closestSummary === null) return false;
        }
        return visibility === "visible";
    };

    const isDisabled = (element) => {
        return !element || element.nodeType !== Node.ELEMENT_NODE || element.classList.contains("disabled") || (element.disabled !== undefined ? element.disabled : element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false");
    };

    const getShadowRoot = (element) => {
        if (!document.documentElement.attachShadow) return null;
        if (typeof element.getRootNode === "function") {
            const rootNode = element.getRootNode();
            return rootNode instanceof ShadowRoot ? rootNode : null;
        }
        return element instanceof ShadowRoot ? element : element.parentNode ? getShadowRoot(element.parentNode) : null;
    };

    const noop = () => {};

    const reflow = (element) => {
        element.offsetHeight; // This is used to trigger a reflow
    };

    const jQuery = () => window.jQuery && !document.body.hasAttribute("data-bs-no-jquery") ? window.jQuery : null;

    const isRTL = () => "rtl" === document.documentElement.dir;

    const bootstrapUtils = {
        getInstance: (element) => instanceManager.get(getElement(element), this.DATA_KEY),
        getOrCreateInstance: (element, config = {}) => {
            return this.getInstance(element) || new this(element, typeof config === "object" ? config : null);
        },
        get VERSION() {
            return "5.3.2";
        },
        get DATA_KEY() {
            return `bs.${this.NAME}`;
        },
        get EVENT_KEY() {
            return `.${this.DATA_KEY}`;
        },
        eventName: (event)