/** @jsx createElement */
export const createElement = (type, props, ...children) => {
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

export const render = (node, parent = null) => {
  if (parent) parent.textContent = "";
  const mount = parent ? (el) => parent.appendChild(el) : (el) => el;
  if (typeof node == "string" || typeof node == "number") {
    return mount(document.createTextNode(node));
  } else if (typeof node == "boolean" || node === null) {
    return mount(document.createTextNode(""));
  } else if (typeof node == "object" && typeof node.type == "function") {
    return Component.render(node, parent);
  } else if (typeof node == "object" && typeof node.type == "string") {
    const dom = document.createElement(node.type);
    for (const child of [
      /* flatten */
    ].concat(...node.children))
      dom.appendChild(render(child));
    for (const prop in node.props) setAttribute(dom, prop, node.props[prop]);
    return mount(dom);
  } else {
    console.error(`Invalid node: ${node}`);
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

export const patch = (dom, vdom, parent = dom.parentNode) => {
  const replace = parent ? (el) => parent.replaceChild(el, dom) : (el) => el;
  if (typeof dom == "object" && typeof vdom.type == "function") {
    return Component.patch(dom, vdom, parent);
  } else if (typeof vdom != "object" && dom instanceof Text) {
    return dom.textContent != vdom ? replace(render(vdom, parent)) : dom;
  } else if (typeof vdom == "object" && dom instanceof Text) {
    return replace(render(vdom, parent));
  } else if (typeof dom == "object" && dom.nodeName != vdom?.type?.toUpperCase()) {
    return replace(render(vdom, parent));
  } else if (typeof vdom == "object" && dom.nodeName == vdom?.type?.toUpperCase()) {
    const pool = {};
    const active = document.activeElement;
    [].concat(...dom.children).map((child, index) => {
      const key = child.__customKey || `__index__${index}`;
      pool[key] = child;
    });
    [].concat(...vdom.children).map((child, index) => {
      const key = (child.props && child.props.key) || `__index__${index}`;
      dom.appendChild(pool[key] ? patch(pool[key], child) : render(child, dom));
      delete pool[key];
    });
    for (const key in pool) {
      const instance = pool[key].__customInstance;
      if (instance) instance.componentWillUnMount();
      pool[key].remove();
    }
    for (const attr of dom.attributes) dom.removeAttribute(attr.name);
    for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
    active.focus();
    return dom;
  }
};

// /* Scroll down to reach playground: */
// /** @jsx createElement */
// const createElement = (type, props, ...children) => {
//   if (props === null) props = {};
//   return { type, props, children };
// };

// const setAttribute = (dom, key, value) => {
//   if (typeof value == "function" && key.startsWith("on")) {
//     const eventType = key.slice(2).toLowerCase();
//     dom.__gooactHandlers = dom.__gooactHandlers || {};
//     dom.removeEventListener(eventType, dom.__gooactHandlers[eventType]);
//     dom.__gooactHandlers[eventType] = value;
//     dom.addEventListener(eventType, dom.__gooactHandlers[eventType]);
//   } else if (key == "checked" || key == "value" || key == "className") {
//     dom[key] = value;
//   } else if (key == "style" && typeof value == "object") {
//     Object.assign(dom.style, value);
//   } else if (key == "ref" && typeof value == "function") {
//     value(dom);
//   } else if (key == "key") {
//     dom.__gooactKey = value;
//   } else if (typeof value != "object" && typeof value != "function") {
//     dom.setAttribute(key, value);
//   }
// };

// const render = (vdom, parent = null) => {
//   console.log("render", vdom);
//   const mount = parent ? (el) => parent.appendChild(el) : (el) => el;
//   if (typeof vdom == "string" || typeof vdom == "number") {
//     return mount(document.createTextNode(vdom));
//   } else if (typeof vdom == "boolean" || vdom === null) {
//     return mount(document.createTextNode(""));
//   } else if (typeof vdom == "object" && typeof vdom.type == "function") {
//     return Component.render(vdom, parent);
//   } else if (typeof vdom == "object" && typeof vdom.type == "string") {
//     const dom = mount(document.createElement(vdom.type));
//     for (const child of [
//       /* flatten */
//     ].concat(...vdom.children))
//       render(child, dom);
//     for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
//     return dom;
//   } else {
//     throw new Error(`Invalid VDOM: ${vdom}.`);
//   }
// };

// const patch = (dom, vdom, parent = dom.parentNode) => {
//   const replace = parent ? (el) => parent.replaceChild(el, dom) && el : (el) => el;
//   if (typeof vdom == "object" && typeof vdom.type == "function") {
//     return Component.patch(dom, vdom, parent);
//   } else if (typeof vdom != "object" && dom instanceof Text) {
//     return dom.textContent != vdom ? replace(render(vdom, parent)) : dom;
//   } else if (typeof vdom == "object" && dom instanceof Text) {
//     return replace(render(vdom, parent));
//   } else if (typeof vdom == "object" && dom.nodeName != vdom.type.toUpperCase()) {
//     return replace(render(vdom, parent));
//   } else if (typeof vdom == "object" && dom.nodeName == vdom.type.toUpperCase()) {
//     const pool = {};
//     const active = document.activeElement;
//     [].concat(...dom.childNodes).map((child, index) => {
//       const key = child.__gooactKey || `__index_${index}`;
//       pool[key] = child;
//     });
//     [].concat(...vdom.children).map((child, index) => {
//       const key = (child.props && child.props.key) || `__index_${index}`;
//       dom.appendChild(pool[key] ? patch(pool[key], child) : render(child, dom));
//       delete pool[key];
//     });
//     for (const key in pool) {
//       const instance = pool[key].__gooactInstance;
//       if (instance) instance.componentWillUnmount();
//       pool[key].remove();
//     }
//     for (const attr of dom.attributes) dom.removeAttribute(attr.name);
//     for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
//     active.focus();
//     return dom;
//   }
// };
