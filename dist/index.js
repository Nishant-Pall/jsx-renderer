(() => {
  // src/renderer.js
  var createElement = (type, props, ...children) => {
    if (props === null) props = {};
    return { type, props, children };
  };
  var render = (node, parent = null) => {
    if (parent) parent.textContent = "";
    const mount = parent ? (el) => parent.appendChild(el) : (el) => el;
    if (typeof node == "string" || typeof node == "number") {
      return mount(document.createTextNode(node));
    } else if (typeof node == "boolean" || node === null) {
      return mount(document.createTextNode(""));
    } else if (typeof node == "object" && typeof node.type == "function") {
      return Component.render(node, parent);
    } else if (typeof node == "object" && typeof node.type == "string") {
      const dom2 = document.createElement(node.type);
      for (const child of [
        /* flatten */
      ].concat(...node.children))
        dom2.appendChild(render(child));
      for (const prop in node.props) setAttribute(dom2, prop, node.props[prop]);
      return mount(dom2);
    } else {
      console.error(`Invalid node: ${node}`);
    }
  };
  var setAttribute = (dom2, key, value) => {
    if (typeof value == "function" && key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      dom2.__customHandler = dom2.__customHandler || {};
      dom2.removeEventListener(eventType, dom2.__customHandler[eventType]);
      dom2.__customHandler[eventType] = value;
      dom2.addEventListener(eventType, dom2.__customHandler[eventType]);
    } else if (key === "className" || key === "checked" || key === "value") {
      dom2[key] = value;
    } else if (key == "style" && typeof value == "object") {
      Object.assign(dom2.style, value);
    } else if (key === "ref" && typeof value == "function") {
      value(dom2);
    } else if (key == "key") {
      dom2.__customKey = value;
    } else if (typeof value != "object" && typeof value != "function") {
      dom2.setAttribute(key, value);
    }
  };
  var patch = (dom2, vdom, parent = dom2.parentNode) => {
    const replace = parent ? (el) => parent.replaceChild(el, dom2) : (el) => el;
    if (typeof dom2 == "object" && typeof vdom.type == "function") {
      return Component.patch(dom2, vdom, parent);
    } else if (typeof vdom != "object" && dom2 instanceof Text) {
      return dom2.textContent != vdom ? replace(render(vdom, parent)) : dom2;
    } else if (typeof vdom == "object" && dom2 instanceof Text) {
      return replace(render(vdom, parent));
    } else if (typeof dom2 == "object" && dom2.nodeName != vdom?.type?.toUpperCase()) {
      return replace(render(vdom, parent));
    } else if (typeof vdom == "object" && dom2.nodeName == vdom?.type?.toUpperCase()) {
      const pool = {};
      const active = document.activeElement;
      [].concat(...dom2.children).map((child, index) => {
        const key = child.__customKey || `__index__${index}`;
        pool[key] = child;
      });
      [].concat(...vdom.children).map((child, index) => {
        const key = child.props && child.props.key || `__index__${index}`;
        dom2.appendChild(pool[key] ? patch(pool[key], child) : render(child, dom2));
        delete pool[key];
      });
      for (const key in pool) {
        const instance = pool[key].__customInstance;
        if (instance) instance.componentWillUnMount();
        pool[key].remove();
      }
      for (const attr of dom2.attributes) dom2.removeAttribute(attr.name);
      for (const prop in vdom.props) setAttribute(dom2, prop, vdom.props[prop]);
      active.focus();
      return dom2;
    }
  };

  // src/index.jsx
  var oldList = /* @__PURE__ */ createElement("ul", { className: "some-list" }, /* @__PURE__ */ createElement("li", { className: "some-list__item", key: "one" }, "One"), /* @__PURE__ */ createElement("li", { className: "some-list__item", key: "two" }, "Two"));
  var newList = /* @__PURE__ */ createElement("ul", { className: "some-list" }, /* @__PURE__ */ createElement("li", { className: "some-list__item", key: "three" }, "Three"), /* @__PURE__ */ createElement("li", { className: "some-list__item", key: "two" }, "Two"));
  var dom = render(oldList, document.getElementById("root"));
  console.log("dom :>> ", dom);
  patch(dom, newList);
})();
