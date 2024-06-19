/** @jsx createElement */
export const createElement = (type, props, ...children) => {
  // for safety
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

export const setAttribute = (dom, key, value) => {
  // handling event listeners, onClick will be click etc
  if (typeof value == "function" && key.startsWith("on")) {
    const eventType = key.slice(2).toLowerCase();
    dom.__customHandler = dom.__customHandler || {};
    dom.removeEventListener(eventType, dom.__customHandler[eventType]);
    dom.__customHandler[eventType] = value;
    dom.addEventListener(eventType, dom.__customHandler[eventType]);
  }
  //  if generic attribute
  else if (key == "className" || key == "checked" || key == "value") {
    dom[key] = value;
  }
  //  set style of dom node
  else if (key == "style" && typeof value == "object") {
    Object.assign(dom.style, value);
  }
  // handling ref
  else if (key == "ref" && typeof value == "function") {
    value(dom);
  }
  // setting key
  else if (key == "key") {
    dom.__customKey = value;
  }
  //  miscellaneous attributes
  else if (typeof value != "object" && typeof value != "function") {
    dom.setAttribute(key, value);
  }
};

export const render = (vdom, parent = null) => {
  // if parent exist for the node, then append the node as its child else return the node itself
  const mount = parent ? (el) => parent.appendChild(el) : (el) => el;

  // if node is normal text, mount a text node
  if (typeof vdom == "string" || typeof vdom == "number") {
    return mount(document.createTextNode(vdom));
  }
  // if node is null or boolean, mount an empty text node
  else if (typeof vdom == "boolean" || vdom === null) {
    return mount(document.createTextNode(""));
  }
  // if node is a function (imported component)
  else if (typeof vdom == "object" && typeof vdom.type == "function") {
    return Component.render(vdom, parent);
  }
  // if node is of type {type, props, children}, i.e. it has children of its own
  else if (typeof vdom == "object" && typeof vdom.type == "string") {
    // create a dom object of the node
    const dom = mount(document.createElement(vdom.type));

    // flatten array of children, this is to handle a case of an array passed as a child
    // if jsx has {...nodeChildren, [1,2,3,4,5]}, it will create something like {...nodeChildre, 1, 2, 3, 4, 5}
    // render child and append it to the dom
    for (const child of [].concat(...vdom.children)) render(child, dom);

    // after rendering, set attributes for the dom object
    for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);

    return mount(dom);
  } else {
    console.error(`Invalid vdom: ${vdom}`);
  }
};

export const patch = (dom, vdom, parent = dom.parentNode) => {
  // if parent exists, replace the child, or just return the node itself
  const replace = parent ? (el) => parent.replaceChild(el, dom) && el : (el) => el;
  // if node is of type function(imported component)
  if (typeof vdom == "object" && typeof vdom.type == "function") {
    return Component.patch(dom, vdom, parent);
  }
  //  if both are text content, just replace if they differ else return the node itself
  else if (typeof vdom != "object" && dom instanceof Text) {
    return dom.textContent != vdom ? replace(render(vdom, parent)) : dom;
  }
  //  if vdom is an object, but dom is text, then replace
  else if (typeof vdom == "object" && dom instanceof Text) {
    return replace(render(vdom, parent));
  }
  //  if both are object but nodes differ
  else if (typeof vdom == "object" && dom.nodeName != vdom?.type?.toUpperCase()) {
    return replace(render(vdom, parent));
  }
  //  if same type of node
  else if (typeof vdom == "object" && dom.nodeName == vdom?.type?.toUpperCase()) {
    const pool = {};
    // maintain active element
    const active = document.activeElement;
    // create a pool of children of the node using key if it exists, else use index
    [].concat(...dom.childNodes).map((child, index) => {
      const key = child.__customKey || `__index__${index}`;
      pool[key] = child;
    });
    [].concat(...vdom.children).map((child, index) => {
      const key = (child.props && child.props.key) || `__index__${index}`;
      // if pool already has key, just patch again else render because key doesnt exist
      dom.appendChild(pool[key] ? patch(pool[key], child) : render(child, dom));
      delete pool[key];
    });
    // remove unused nodes
    for (const key in pool) {
      const instance = pool[key].__customInstance;
      if (instance) instance.componentWillUnmount();
      pool[key].remove();
    }
    // apply new attributes
    for (const attr of dom.attributes) dom.removeAttribute(attr.name);
    for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
    active.focus();
    return dom;
  }
};

export class Component {
  constructor(props) {
    this.props = props || {};
    this.state = null;
  }

  static render(vdom, parent = null) {
    const props = Object.assign({}, vdom.props, { children: vdom.children });
    if (Component.isPrototypeOf(vdom.type)) {
      const instance = new vdom.type(props);
      instance.componentWillMount();
      instance.base = render(instance.render(), parent);
      instance.base.__customInstance = instance;
      instance.base.__customKey = vdom.props.key;
      instance.componentDidMount();
      return instance.base;
    } else {
      return render(vdom.type(props), parent);
    }
  }

  static patch(dom, vdom, parent = dom.parentNode) {
    const props = Object.assign({}, vdom.props, { children: vdom.children });
    if (dom.__customInstance && dom.__customInstance.constructor == vdom.type) {
      dom.__customInstance.componentWillReceiveProps(props);
      dom.__customInstance.props = props;
      return patch(dom, dom.__customInstance.render(), parent);
    } else if (Component.isPrototypeOf(vdom.type)) {
      const ndom = Component.render(vdom, parent);
      return parent ? parent.replaceChild(ndom, dom) && ndom : ndom;
    } else if (!Component.isPrototypeOf(vdom.type)) {
      return patch(dom, vdom.type(props), parent);
    }
  }

  setState(nextState) {
    if (this.base && this.shouldComponentUpdate(this.props, nextState)) {
      const prevState = this.state;
      this.componentWillUpdate(this.props, nextState);
      this.state = nextState;
      patch(this.base, this.render());
      this.componentDidUpdate(this.props, prevState);
    } else {
      this.state = nextState;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps != this.props || nextState != this.state;
  }

  componentWillReceiveProps(nextProps) {
    return undefined;
  }

  componentWillUpdate(nextProps, nextState) {
    return undefined;
  }

  componentDidUpdate(prevProps, prevState) {
    return undefined;
  }

  componentWillMount() {
    return undefined;
  }

  componentDidMount() {
    return undefined;
  }

  componentWillUnmount() {
    return undefined;
  }
}
