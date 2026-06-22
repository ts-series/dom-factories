/*

© 2026 Enrico Rippin <e@rippin.org>

Released into the public domain under the Unlicense. See <http://unlicense.org/>.

1  HTML ATTRIBUTES
2  AUXILIARY FUNCTIONS
3  ADDITIONAL ELEMENT METHODS
4  STANDALONE DOM UTILITY FUNCTIONS
5  FACTORIES FOR NON-VOID HTML ELEMENTS
6  FACTORIES FOR VOID HTML ELEMENTS
7  FACTORIES FOR SVG ELEMENTS
8  FACTORIES FOR MATHEMATICAL MARKUP

*/

// 1  HTML ATTRIBUTES

const BooleanAttributes = new Set([
	"allowfullscreen", "async", "autofocus", "autoplay", "checked",
	"controls", "default", "defer", "disabled", "formnovalidate",
	"hidden", "ismap", "loop", "multiple", "muted", "novalidate",
	"open", "playsinline", "readonly", "required", "reversed",
	"selected",
]);


const KnownAttributes = new Set([
	"accept", "accept-charset", "accesskey", "action", "allow", "alt",
	"autocapitalize", "autocomplete", "background", "buffered", "capture",
	"charset", "cite", "class", "cols", "colspan", "content",
	"contenteditable", "contextmenu", "coords", "crossorigin", "csp",
	"data", "datetime", "decoding", "dir", "dirname", "download",
	"draggable", "enctype", "enterkeyhint", "for", "form", "formaction",
	"formenctype", "formmethod", "formtarget", "headers", "height",
	"high", "href", "hreflang", "http-equiv", "icon", "id", "integrity",
	"inputmode", "itemprop", "itemscope", "keytype", "kind", "label",
	"lang", "loading", "list", "low", "max", "maxlength", "media",
	"method", "min", "minlength", "name", "optimum", "pattern", "ping",
	"placeholder", "poster", "preload", "radiogroup", "referrerpolicy",
	"rel", "role", "rows", "rowspan", "sandbox", "scope", "shape",
	"size", "sizes", "slot", "span", "spellcheck", "src", "srcdoc",
	"srclang", "srcset", "start", "step", "style", "tabindex", "target",
	"title", "translate", "type", "usemap", "value", "width", "wrap",
	...BooleanAttributes,
]);


// 2  AUXILIARY FUNCTIONS

type EventValue = EventListener | EventListener[]

function toKebab(str: string): string {
	return str
		.replace(/_+/g, '-')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase();
}


/** Returns true if value is a plain object literal, not an array, DOM node, or class instance. */
function isPlainObject(value: unknown): boolean {
	return value !== null
		&& typeof value === 'object'
		&& Object.getPrototypeOf(value) === Object.prototype;
}


/** Appends one content argument to an element, handling HTMLElement, null/undefined, and stringifiable values. */
function appendContent(el: HTMLElement, arg: unknown): void {
	if (arg == null) {
		return;
	}
	else if (Array.isArray(arg)) {
		for (const item of arg) appendContent(el, item);
	}
	else if (arg instanceof HTMLElement) {
		el.appendChild(arg);
	}
	else {
		el.appendChild(document.createTextNode(String(arg)));
	}
}


/** Applies a single attribute key/value pair to an element, handling class arrays and style objects. */
function applyAttr(el: HTMLElement, key: string, value: unknown): void {
	let attr = toKebab(key);

	if (!KnownAttributes.has(attr) && !attr.startsWith("data-")) attr = `data-${attr}`;

	if (attr === "style") {
		if (isPlainObject(value)) {
			for (const [k, val] of Object.entries(value as Record<string, string>)) {
				(el.style as any)[k] = val;
			}
		}
		else {
			el.style.cssText = value as string;
		}
	}
	else if (value === true || (value === null && BooleanAttributes.has(attr))) {
		el.setAttribute(attr, "");
	}
	else if (value !== false) {
		el.setAttribute(attr, Array.isArray(value) ? value.join(" ") : String(value));
	}
}


/** Binds one or more event listeners of the given type to an element. */
function bindEvent(el: Element, type: string, value: EventValue, options?: AddEventListenerOptions): void {
	if (Array.isArray(value)) {
		for (const fn of value) el.addEventListener(type, fn, options);
	}
	else {
		el.addEventListener(type, value, options);
	}
}


/** Removes one or more event listeners of the given type from an element. */
function unbindEvent(el: Element, type: string, value: EventValue, options?: boolean | EventListenerOptions): void {
	if (Array.isArray(value)) {
		for (const fn of value) el.removeEventListener(type, fn, options);
	}
	else {
		el.removeEventListener(type, value, options);
	}
}


// 3  ADDITIONAL ELEMENT METHODS

type SetProxy = ((attributes: Record<string, unknown>) => Element) & {
	[key: string]: (value: unknown) => Element
}

type OnProxy = ((events: Record<string, EventValue>) => Element) & {
	[key: string]: (value: EventValue, options?: AddEventListenerOptions) => Element
}

type OffProxy = ((events: Record<string, EventValue>) => Element) & {
	[key: string]: (value: EventValue, options?: boolean | EventListenerOptions) => Element
}


declare global {
	interface Element {
		set: SetProxy
		on: OnProxy
		off: OffProxy
		appendTo<T extends Element>(this: T, parent: Element): T
		renewContent(...args: unknown[]): Element
		__setProxy?: SetProxy
		__onProxy?: OnProxy
		__offProxy?: OffProxy
	}
}


Object.defineProperty(Element.prototype, "set", {
	get() {
		const el = this;
		if (!el.__setProxy) {
			const fn = (attributes: Record<string, unknown>) => {
				for (const [key, value] of Object.entries(attributes)) {
					applyAttr(el, key, value);
				}
				return el;
			};

			el.__setProxy = new Proxy(fn, {
				get(_, prop) {
					return (val: unknown) => {
						applyAttr(el, prop.toString(), val);
						return el;
					};
				}
			});
		}

		return el.__setProxy;
	}
});


Object.defineProperty(Element.prototype, "on", {
	get() {
		const el = this;
		if (!el.__onProxy) {
			const fn = (events: Record<string, EventValue>) => {
				for (const [type, value] of Object.entries(events)) {
					bindEvent(el, type, value);
				}
				return el;
			};

			el.__onProxy = new Proxy(fn, {
				get(_, prop) {
					return (value: EventValue, options?: AddEventListenerOptions) => {
						bindEvent(el, prop.toString(), value, options);
						return el;
					};
				}
			});
		}

		return el.__onProxy;
	}
});


Object.defineProperty(Element.prototype, "off", {
	get() {
		const el = this;
		if (!el.__offProxy) {
			const fn = (events: Record<string, EventValue>) => {
				for (const [type, value] of Object.entries(events)) {
					unbindEvent(el, type, value);
				}
				return el;
			};

			el.__offProxy = new Proxy(fn, {
				get(_, prop) {
					return (value: EventValue, options?: boolean | EventListenerOptions) => {
						unbindEvent(el, prop.toString(), value, options);
						return el;
					};
				}
			});
		}

		return el.__offProxy;
	}
});


Object.defineProperty(Element.prototype, "appendTo", {
	value(parent: Element) {
		parent.appendChild(this);
		return this;
	}
});


Object.defineProperty(Element.prototype, "renewContent", {
	value(...args: unknown[]) {
		const el = this;
		el.replaceChildren();
		for (const arg of args) appendContent(el, arg);
		return el;
	}
});


// 4  STANDALONE DOM UTILITY FUNCTIONS

/** Returns the element with the given id, cast to the given type, or null. */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
	return document.getElementById(id) as T | null;
}


// 5  FACTORIES FOR NON-VOID HTML ELEMENTS

/** Creates a builder function for generating elements with the specified tag name. */
export function getHTMLElementFactory(tagName: string): (...args: unknown[]) => HTMLElement {
	/** Creates an element, applies optional leading attributes object, and appends remaining content. */
	return (...args: unknown[]) => {
		const elem = document.createElement(tagName);

		let start = 0;
		if (args.length > 0 && isPlainObject(args[0])) {
			for (const [key, value] of Object.entries(args[0] as Record<string, unknown>)) {
				applyAttr(elem, key, value);
			}
			start = 1;
		}

		for (let i = start; i < args.length; i++) {
			appendContent(elem, args[i]);
		}

		return elem;
	}
}


//

/** Creates and returns an anchor; first arg may be attributes object or href string if followed by string content. */
export function a(...args: unknown[]): HTMLElement {
	const elem = document.createElement("a");

	let start = 0;
	if (args.length > 0 && isPlainObject(args[0])) {
		for (const [key, value] of Object.entries(args[0] as Record<string, unknown>)) {
			applyAttr(elem, key, value);
		}
		start = 1;
	}
	else if (typeof args[0] === "string" && typeof args[1] === "string") {
		elem.setAttribute("href", args[0]);
		start = 1;
	}

	for (let i = start; i < args.length; i++) {
		appendContent(elem, args[i]);
	}

	return elem;
}


//

/** Creates a builder for a button with a fixed type attribute. */
function getButtonFactory(type: "button" | "submit" | "reset"): (...args: unknown[]) => HTMLButtonElement {
	const base = getHTMLElementFactory("button");
	return (...args: unknown[]) => {
		const elem = base(...args) as HTMLButtonElement;
		elem.type = type;
		return elem;
	};
}


/** Creates a button element with type="button"; first arg may be attributes object. */
export const button = Object.assign(getButtonFactory("button"), {
	/** Creates a button element with type="submit". */
	submit: getButtonFactory("submit"),
	/** Creates a button element with type="reset". */
	reset: getButtonFactory("reset"),
});


//

export const abbr = getHTMLElementFactory("abbr");
export const address = getHTMLElementFactory("address");
export const article = getHTMLElementFactory("article");
export const aside = getHTMLElementFactory("aside");
export const audio = getHTMLElementFactory("audio");
export const b = getHTMLElementFactory("b");
export const bdi = getHTMLElementFactory("bdi");
export const bdo = getHTMLElementFactory("bdo");
export const blockquote = getHTMLElementFactory("blockquote");
export const body = getHTMLElementFactory("body");
export const canvas = getHTMLElementFactory("canvas");
export const caption = getHTMLElementFactory("caption");
export const cite = getHTMLElementFactory("cite");
export const code = getHTMLElementFactory("code");
export const colgroup = getHTMLElementFactory("colgroup");
export const data = getHTMLElementFactory("data");
export const datalist = getHTMLElementFactory("datalist");
export const dd = getHTMLElementFactory("dd");
export const del = getHTMLElementFactory("del");
export const details = getHTMLElementFactory("details");
export const dfn = getHTMLElementFactory("dfn");
export const dialog = getHTMLElementFactory("dialog");
export const div = getHTMLElementFactory("div");
export const dl = getHTMLElementFactory("dl");
export const dt = getHTMLElementFactory("dt");
export const em = getHTMLElementFactory("em");
export const fieldset = getHTMLElementFactory("fieldset");
export const figcaption = getHTMLElementFactory("figcaption");
export const figure = getHTMLElementFactory("figure");
export const footer = getHTMLElementFactory("footer");
export const form = getHTMLElementFactory("form");
export const h1 = getHTMLElementFactory("h1");
export const h2 = getHTMLElementFactory("h2");
export const h3 = getHTMLElementFactory("h3");
export const h4 = getHTMLElementFactory("h4");
export const h5 = getHTMLElementFactory("h5");
export const h6 = getHTMLElementFactory("h6");
export const head = getHTMLElementFactory("head");
export const header = getHTMLElementFactory("header");
export const hgroup = getHTMLElementFactory("hgroup");
export const html = getHTMLElementFactory("html");
export const i = getHTMLElementFactory("i");
export const iframe = getHTMLElementFactory("iframe");
export const ins = getHTMLElementFactory("ins");
export const kbd = getHTMLElementFactory("kbd");
export const label = getHTMLElementFactory("label");
export const legend = getHTMLElementFactory("legend");
export const li = getHTMLElementFactory("li");
export const main = getHTMLElementFactory("main");
export const map = getHTMLElementFactory("map");
export const mark = getHTMLElementFactory("mark");
export const menu = getHTMLElementFactory("menu");
export const menuitem = getHTMLElementFactory("menuitem");
export const meter = getHTMLElementFactory("meter");
export const nav = getHTMLElementFactory("nav");
export const noscript = getHTMLElementFactory("noscript");
export const object = getHTMLElementFactory("object");
export const ol = getHTMLElementFactory("ol");
export const optgroup = getHTMLElementFactory("optgroup");
export const option = getHTMLElementFactory("option");
export const output = getHTMLElementFactory("output");
export const p = getHTMLElementFactory("p");
export const picture = getHTMLElementFactory("picture");
export const pre = getHTMLElementFactory("pre");
export const progress = getHTMLElementFactory("progress");
export const q = getHTMLElementFactory("q");
export const rp = getHTMLElementFactory("rp");
export const rt = getHTMLElementFactory("rt");
export const ruby = getHTMLElementFactory("ruby");
export const s = getHTMLElementFactory("s");
export const samp = getHTMLElementFactory("samp");
export const script = getHTMLElementFactory("script");
export const search = getHTMLElementFactory("search");
export const section = getHTMLElementFactory("section");
export const select = getHTMLElementFactory("select");
export const slot = getHTMLElementFactory("slot");
export const small = getHTMLElementFactory("small");
export const span = getHTMLElementFactory("span");
export const strong = getHTMLElementFactory("strong");
export const style = getHTMLElementFactory("style");
export const sub = getHTMLElementFactory("sub");
export const summary = getHTMLElementFactory("summary");
export const sup = getHTMLElementFactory("sup");
export const table = getHTMLElementFactory("table");
export const tbody = getHTMLElementFactory("tbody");
export const td = getHTMLElementFactory("td");
export const template = getHTMLElementFactory("template");
export const textarea = getHTMLElementFactory("textarea");
export const tfoot = getHTMLElementFactory("tfoot");
export const th = getHTMLElementFactory("th");
export const thead = getHTMLElementFactory("thead");
export const time = getHTMLElementFactory("time");
export const title = getHTMLElementFactory("title");
export const tr = getHTMLElementFactory("tr");
export const u = getHTMLElementFactory("u");
export const ul = getHTMLElementFactory("ul");
export const variable = getHTMLElementFactory("var");
export const video = getHTMLElementFactory("video");


// 6  FACTORIES FOR VOID HTML ELEMENTS

/** Creates a builder function for a void element that optionally accepts an attributes object. */
export function getVoidHTMLElementFactory(tagName: string): (attributes?: Record<string, unknown>) => HTMLElement {
	return (attributes: Record<string, unknown> = {}) => {
		const elem = document.createElement(tagName);
		if (isPlainObject(attributes)) {
			for (const [key, value] of Object.entries(attributes)) applyAttr(elem, key, value);
		}
		return elem;
	}
}


export const area = getVoidHTMLElementFactory("area");
export const base = getVoidHTMLElementFactory("base");
export const br = getVoidHTMLElementFactory("br");
export const col = getVoidHTMLElementFactory("col");
export const embed = getVoidHTMLElementFactory("embed");
export const hr = getVoidHTMLElementFactory("hr");
export const img = getVoidHTMLElementFactory("img");
export const input = getVoidHTMLElementFactory("input");
export const link = getVoidHTMLElementFactory("link");
export const meta = getVoidHTMLElementFactory("meta");
export const param = getVoidHTMLElementFactory("param");
export const source = getVoidHTMLElementFactory("source");
export const track = getVoidHTMLElementFactory("track");
export const wbr = getVoidHTMLElementFactory("wbr");


// 7  FACTORIES FOR SVG ELEMENTS

function getSvgElementFactory(tagName: string): (...args: unknown[]) => SVGElement {
	return (...args: unknown[]) => {
		const elem = document.createElementNS("http://www.w3.org/2000/svg", tagName) as unknown as HTMLElement;

		let start = 0;
		if (args.length > 0 && isPlainObject(args[0])) {
			for (const [key, value] of Object.entries(args[0] as Record<string, unknown>)) {
				applyAttr(elem, key, value);
			}
			start = 1;
		}

		for (let i = start; i < args.length; i++) {
			appendContent(elem, args[i]);
		}

		return elem as unknown as SVGElement;
	}
}


export const svg = Object.assign(getSvgElementFactory("svg"), {
	circle: getSvgElementFactory("circle"),
	rect: getSvgElementFactory("rect"),
	line: getSvgElementFactory("line"),
	ellipse: getSvgElementFactory("ellipse"),
	polyline: getSvgElementFactory("polyline"),
	polygon: getSvgElementFactory("polygon"),
	path: getSvgElementFactory("path"),
	text: getSvgElementFactory("text"),
	tspan: getSvgElementFactory("tspan"),
	textPath: getSvgElementFactory("textPath"),
	g: getSvgElementFactory("g"),
	defs: getSvgElementFactory("defs"),
	symbol: getSvgElementFactory("symbol"),
	use: getSvgElementFactory("use"),
	marker: getSvgElementFactory("marker"),
	image: getSvgElementFactory("image"),
	linearGradient: getSvgElementFactory("linearGradient"),
	radialGradient: getSvgElementFactory("radialGradient"),
	pattern: getSvgElementFactory("pattern"),
	stop: getSvgElementFactory("stop"),
	clipPath: getSvgElementFactory("clipPath"),
	mask: getSvgElementFactory("mask"),
	filter: getSvgElementFactory("filter"),
	feBlend: getSvgElementFactory("feBlend"),
	feColorMatrix: getSvgElementFactory("feColorMatrix"),
	feComponentTransfer: getSvgElementFactory("feComponentTransfer"),
	feComposite: getSvgElementFactory("feComposite"),
	feConvolveMatrix: getSvgElementFactory("feConvolveMatrix"),
	feDiffuseLighting: getSvgElementFactory("feDiffuseLighting"),
	feDisplacementMap: getSvgElementFactory("feDisplacementMap"),
	feDropShadow: getSvgElementFactory("feDropShadow"),
	feFlood: getSvgElementFactory("feFlood"),
	feGaussianBlur: getSvgElementFactory("feGaussianBlur"),
	feImage: getSvgElementFactory("feImage"),
	feMerge: getSvgElementFactory("feMerge"),
	feMergeNode: getSvgElementFactory("feMergeNode"),
	feMorphology: getSvgElementFactory("feMorphology"),
	feOffset: getSvgElementFactory("feOffset"),
	feSpecularLighting: getSvgElementFactory("feSpecularLighting"),
	feTile: getSvgElementFactory("feTile"),
	feTurbulence: getSvgElementFactory("feTurbulence"),
	animate: getSvgElementFactory("animate"),
	animateTransform: getSvgElementFactory("animateTransform"),
	animateMotion: getSvgElementFactory("animateMotion"),
	set: getSvgElementFactory("set"),
	desc: getSvgElementFactory("desc"),
	metadata: getSvgElementFactory("metadata"),
	foreignObject: getSvgElementFactory("foreignObject"),
	switch: getSvgElementFactory("switch"),
	view: getSvgElementFactory("view"),
	a: getSvgElementFactory("a"),
	script: getSvgElementFactory("script"),
	style: getSvgElementFactory("style"),
	title: getSvgElementFactory("title"),
});


// 8  FACTORIES FOR MATHEMATICAL MARKUP

function getMathElementFactory(tagName: string): (...args: unknown[]) => Element {
	return (...args: unknown[]) => {
		const elem = document.createElementNS("http://www.w3.org/1998/Math/MathML", tagName) as unknown as HTMLElement;

		let start = 0;
		if (args.length > 0 && isPlainObject(args[0])) {
			for (const [key, value] of Object.entries(args[0] as Record<string, unknown>)) {
				applyAttr(elem, key, value);
			}
			start = 1;
		}

		for (let i = start; i < args.length; i++) {
			appendContent(elem, args[i]);
		}

		return elem as unknown as Element;
	}
}


export const math = Object.assign(getMathElementFactory("math"), {
	mrow: getMathElementFactory("mrow"),
	mfrac: getMathElementFactory("mfrac"),
	msqrt: getMathElementFactory("msqrt"),
	mroot: getMathElementFactory("mroot"),
	mstyle: getMathElementFactory("mstyle"),
	merror: getMathElementFactory("merror"),
	mpadded: getMathElementFactory("mpadded"),
	mphantom: getMathElementFactory("mphantom"),
	mfenced: getMathElementFactory("mfenced"),
	menclose: getMathElementFactory("menclose"),
	msub: getMathElementFactory("msub"),
	msup: getMathElementFactory("msup"),
	msubsup: getMathElementFactory("msubsup"),
	munder: getMathElementFactory("munder"),
	mover: getMathElementFactory("mover"),
	munderover: getMathElementFactory("munderover"),
	mmultiscripts: getMathElementFactory("mmultiscripts"),
	mtable: getMathElementFactory("mtable"),
	mtr: getMathElementFactory("mtr"),
	mtd: getMathElementFactory("mtd"),
	mlabeledtr: getMathElementFactory("mlabeledtr"),
	mi: getMathElementFactory("mi"),
	mn: getMathElementFactory("mn"),
	mo: getMathElementFactory("mo"),
	mtext: getMathElementFactory("mtext"),
	mspace: getMathElementFactory("mspace"),
	ms: getMathElementFactory("ms"),
	maction: getMathElementFactory("maction"),
	annotation: getMathElementFactory("annotation"),
	semantics: getMathElementFactory("semantics"),
});