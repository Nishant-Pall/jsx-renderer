/** @jsx createElement */
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

const render = (vdom, parent = null) => {
  if (parent) parent.textContent = "";
  const mount = parent ? (el) => parent.appendChild(el) : (el) => el;
  if (typeof vdom == "string" || typeof vdom == "number") {
    return mount(document.createTextNode(vdom));
  } else if (typeof vdom == "boolean" || vdom === null) {
    return mount(document.createTextNode(""));
  } else if (typeof vdom == "object" && typeof vdom.type == "function") {
    return Component.render(vdom, parent);
  } else if (typeof vdom == "object" && typeof vdom.type == "string") {
    const dom = document.createElement(vdom.type);
    for (const child of [
      /* flatten */
    ].concat(...vdom.children))
      dom.appendChild(render(child));
    for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
    return mount(dom);
  } else {
    console.log(vdom);
    console.error(`Invalid VDOM: ${vdom}`);
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

let vdom = (
  <div id="foo">
    <button
      onClick={() => {
        console.log(12312312321);
      }}>
      Click Me
    </button>
    <ul>
      {list.map((l) => (
        <li>{l}</li>
      ))}
      <li className="hello-1">1</li>
      <ul>
        <li className="hello-2">inner</li>
        <li className="hello-3">inner</li>
      </ul>
      <li className="hello-2">2</li>
      <li className="hello-3">3</li>
    </ul>
  </div>
);

// let prettyVdom = JSON.stringify(vdom, null, 4);

render(vdom, document.getElementById("root"));
// let dom = render(vdom);
