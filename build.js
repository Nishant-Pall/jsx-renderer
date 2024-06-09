const createElement = (type, props, ...children) => {
  if (props === null) props = {};
  return { type, props, children };
};
function legacyRender(vnode) {
  if (vnode.split) return document.createTextNode(vnode);
  let node = document.createElement(vnode.nodeName);
  let attrs = vnode.props || {};
  Object.keys(attrs).forEach((key) => node.setAttribute(key, attrs[key]));
  (vnode.children || []).forEach((n) => node.appendChild(legacyRender(n)));
  return node;
}
const render = (vdom2, parent = null) => {
  if (parent) parent.textContent = "";
  const mount = parent ? (el) => parent.appendChild(el) : (el) => el;
  if (typeof vdom2 == "string" || typeof vdom2 == "number") {
    return mount(document.createTextNode(vdom2));
  } else if (typeof vdom2 == "boolean" || vdom2 === null) {
    return mount(document.createTextNode(""));
  } else if (typeof vdom2 == "object" && typeof vdom2.type == "function") {
    return Component.render(vdom2, parent);
  } else if (typeof vdom2 == "object" && typeof vdom2.type == "string") {
    const dom = document.createElement(vdom2.type);
    for (const child of [
      /* flatten */
    ].concat(...vdom2.children))
      dom.appendChild(render(child));
    for (const prop in vdom2.props) setAttribute(dom, prop, vdom2.props[prop]);
    return mount(dom);
  } else {
    console.log(vdom2);
    console.error(`Invalid VDOM: ${vdom2}`);
  }
};
const setAttribute = (dom, key, value) => {
  if (typeof value == "function" && key.startsWith("on")) {
    const eventType = key.slice(2).toLowerCase();
    dom.__customHandler = dom.__customHandler || {};
    dom.removeEventListener(eventType, dom.__customHandler[eventType]);
    dom.__customHandler[eventType] = value;
    dom.addEventListener(eventType, dom.__customHandler[eventType]);
  } else if (key === "className" || key === "checked" || key === "value") {
    dom[key] = value;
  } else if (key == "style" && typeof value == "object") {
    Object.assign(dom.style, value);
  } else if (key === "ref" && typeof value == "function") {
    value(dom);
  } else if (key == "key") {
    dom.__customKey = value;
  } else if (typeof value != "object" && typeof value != "function") {
    dom.setAttribute(key, value);
  }
};
const list = [1, 2, 3, 4];
let vdom = /* @__PURE__ */ createElement(
  "div",
  { id: "foo" },
  /* @__PURE__ */ createElement(
    "button",
    {
      onClick: () => {
        console.log(12312312321);
      },
    },
    "Click Me"
  ),
  /* @__PURE__ */ createElement(
    "ul",
    null,
    list.map((l) => /* @__PURE__ */ createElement("li", null, l)),
    /* @__PURE__ */ createElement("li", { className: "hello-1" }, "1"),
    /* @__PURE__ */ createElement(
      "ul",
      null,
      /* @__PURE__ */ createElement("li", { className: "hello-2" }, "inner"),
      /* @__PURE__ */ createElement("li", { className: "hello-3" }, "inner")
    ),
    /* @__PURE__ */ createElement("li", { className: "hello-2" }, "2"),
    /* @__PURE__ */ createElement("li", { className: "hello-3" }, "3")
  )
);
render(vdom, document.getElementById("root"));
