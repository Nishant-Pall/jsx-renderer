(() => {
  // src/renderer.js
  var createElement = (type, props, ...children) => {
    if (props === null) props = {};
    return { type, props, children };
  };
  var setAttribute = (dom2, key, value) => {
    if (typeof value == "function" && key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      dom2.__customHandler = dom2.__customHandler || {};
      dom2.removeEventListener(eventType, dom2.__customHandler[eventType]);
      dom2.__customHandler[eventType] = value;
      dom2.addEventListener(eventType, dom2.__customHandler[eventType]);
    } else if (key == "className" || key == "checked" || key == "value") {
      dom2[key] = value;
    } else if (key == "style" && typeof value == "object") {
      Object.assign(dom2.style, value);
    } else if (key == "ref" && typeof value == "function") {
      value(dom2);
    } else if (key == "key") {
      dom2.__customKey = value;
    } else if (typeof value != "object" && typeof value != "function") {
      dom2.setAttribute(key, value);
    }
  };
  var render = (vdom, parent = null) => {
    const mount = parent ? (el) => parent.appendChild(el) : (el) => el;
    if (typeof vdom == "string" || typeof vdom == "number") {
      return mount(document.createTextNode(vdom));
    } else if (typeof vdom == "boolean" || vdom === null) {
      return mount(document.createTextNode(""));
    } else if (typeof vdom == "object" && typeof vdom.type == "function") {
      return Component.render(vdom, parent);
    } else if (typeof vdom == "object" && typeof vdom.type == "string") {
      const dom2 = mount(document.createElement(vdom.type));
      for (const child of [].concat(...vdom.children)) render(child, dom2);
      for (const prop in vdom.props) setAttribute(dom2, prop, vdom.props[prop]);
      return mount(dom2);
    } else {
      console.error(`Invalid vdom: ${vdom}`);
    }
  };
  var patch = (dom2, vdom, parent = dom2.parentNode) => {
    const replace = parent ? (el) => parent.replaceChild(el, dom2) && el : (el) => el;
    if (typeof vdom == "object" && typeof vdom.type == "function") {
      return Component.patch(dom2, vdom, parent);
    } else if (typeof vdom != "object" && dom2 instanceof Text) {
      return dom2.textContent != vdom ? replace(render(vdom, parent)) : dom2;
    } else if (typeof vdom == "object" && dom2 instanceof Text) {
      return replace(render(vdom, parent));
    } else if (typeof vdom == "object" && dom2.nodeName != vdom?.type?.toUpperCase()) {
      return replace(render(vdom, parent));
    } else if (typeof vdom == "object" && dom2.nodeName == vdom?.type?.toUpperCase()) {
      const pool = {};
      const active = document.activeElement;
      [].concat(...dom2.childNodes).map((child, index) => {
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
        if (instance) instance.componentWillUnmount();
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
  var newList = /* @__PURE__ */ createElement("ul", { className: "some-list" }, /* @__PURE__ */ createElement("li", { className: "some-list__item", key: "one" }, "Four"), /* @__PURE__ */ createElement("li", { className: "some-list__item", key: "three" }, "Three"), /* @__PURE__ */ createElement("li", { className: "some-list__item", key: "two" }, "Two"));
  var dom = render(oldList, document.getElementById("root"));
  console.log("dom :>> ", dom);
  patch(dom, newList);
})();
