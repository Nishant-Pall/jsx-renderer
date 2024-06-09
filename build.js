function createElement(nodeName, attributes, ...args) {
  let children = args.length ? [].concat(args) : null;
  return { nodeName, attributes, children };
}
function render(vnode) {
  if (vnode.split) return document.createTextNode(vnode);
  let node = document.createElement(vnode.nodeName);
  let attrs = vnode.attributes || {};
  Object.keys(attrs).forEach((key) => node.setAttribute(key, attrs[key]));
  (vnode.children || []).forEach((n) => node.appendChild(render(n)));
  return node;
}
let vdom = /* @__PURE__ */ createElement("div", { id: "foo" }, /* @__PURE__ */ createElement("ul", null, /* @__PURE__ */ createElement("li", null, "1"), /* @__PURE__ */ createElement("li", null, "1"), /* @__PURE__ */ createElement("li", null, "1"), /* @__PURE__ */ createElement("li", null, "1"), /* @__PURE__ */ createElement("li", null, "1")));
let prettyVdom = JSON.stringify(vdom, null, 4);
console.log(prettyVdom);
let dom = render(vdom);
document.body.appendChild(dom);
