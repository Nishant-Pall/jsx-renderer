(() => {
  // src/renderer.js
  var createElement = (type, props, ...children) => {
    if (props === null) props = {};
    return { type, props, children };
  };
  var setAttribute = (dom, key, value) => {
    if (typeof value == "function" && key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      dom.__customHandler = dom.__customHandler || {};
      dom.removeEventListener(eventType, dom.__customHandler[eventType]);
      dom.__customHandler[eventType] = value;
      dom.addEventListener(eventType, dom.__customHandler[eventType]);
    } else if (key == "className" || key == "checked" || key == "value") {
      dom[key] = value;
    } else if (key == "style" && typeof value == "object") {
      Object.assign(dom.style, value);
    } else if (key == "ref" && typeof value == "function") {
      value(dom);
    } else if (key == "key") {
      dom.__customKey = value;
    } else if (typeof value != "object" && typeof value != "function") {
      dom.setAttribute(key, value);
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
      const dom = mount(document.createElement(vdom.type));
      for (const child of [].concat(...vdom.children)) render(child, dom);
      for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
      return mount(dom);
    } else {
      console.error(`Invalid vdom: ${vdom}`);
    }
  };
  var patch = (dom, vdom, parent = dom.parentNode) => {
    const replace = parent ? (el) => parent.replaceChild(el, dom) && el : (el) => el;
    if (typeof vdom == "object" && typeof vdom.type == "function") {
      return Component.patch(dom, vdom, parent);
    } else if (typeof vdom != "object" && dom instanceof Text) {
      return dom.textContent != vdom ? replace(render(vdom, parent)) : dom;
    } else if (typeof vdom == "object" && dom instanceof Text) {
      return replace(render(vdom, parent));
    } else if (typeof vdom == "object" && dom.nodeName != vdom?.type?.toUpperCase()) {
      return replace(render(vdom, parent));
    } else if (typeof vdom == "object" && dom.nodeName == vdom?.type?.toUpperCase()) {
      const pool = {};
      const active = document.activeElement;
      [].concat(...dom.childNodes).map((child, index) => {
        const key = child.__customKey || `__index__${index}`;
        pool[key] = child;
      });
      [].concat(...vdom.children).map((child, index) => {
        const key = child.props && child.props.key || `__index__${index}`;
        dom.appendChild(pool[key] ? patch(pool[key], child) : render(child, dom));
        delete pool[key];
      });
      for (const key in pool) {
        const instance = pool[key].__customInstance;
        if (instance) instance.componentWillUnmount();
        pool[key].remove();
      }
      for (const attr of dom.attributes) dom.removeAttribute(attr.name);
      for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
      active.focus();
      return dom;
    }
  };
  var Component = class _Component {
    constructor(props) {
      this.props = props || {};
      this.state = null;
    }
    static render(vdom, parent = null) {
      const props = Object.assign({}, vdom.props, { children: vdom.children });
      if (_Component.isPrototypeOf(vdom.type)) {
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
      } else if (_Component.isPrototypeOf(vdom.type)) {
        const ndom = _Component.render(vdom, parent);
        return parent ? parent.replaceChild(ndom, dom) && ndom : ndom;
      } else if (!_Component.isPrototypeOf(vdom.type)) {
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
      return void 0;
    }
    componentWillUpdate(nextProps, nextState) {
      return void 0;
    }
    componentDidUpdate(prevProps, prevState) {
      return void 0;
    }
    componentWillMount() {
      return void 0;
    }
    componentDidMount() {
      return void 0;
    }
    componentWillUnmount() {
      return void 0;
    }
  };

  // src/index.jsx
  var TodoItem = class extends Component {
    render() {
      return /* @__PURE__ */ createElement("li", { className: "todo__item" }, /* @__PURE__ */ createElement("span", null, this.props.text, " - "), /* @__PURE__ */ createElement("a", { href: "#", onClick: this.props.onClick }, "X"));
    }
  };
  var Todo = class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        input: "",
        items: []
      };
      this.handleAdd("Goal #1");
      this.handleAdd("Goal #2");
      this.handleAdd("Goal #3");
    }
    handleInput(e) {
      this.setState({
        input: e.target.value,
        items: this.state.items
      });
    }
    handleAdd(text) {
      const newItems = [].concat(this.state.items);
      newItems.push({
        id: Math.random(),
        text
      });
      this.setState({
        input: "",
        items: newItems
      });
    }
    handleRemove(index) {
      const newItems = [].concat(this.state.items);
      newItems.splice(index, 1);
      this.setState({
        input: this.state.input,
        items: newItems
      });
    }
    render() {
      return /* @__PURE__ */ createElement("div", { className: "todo" }, /* @__PURE__ */ createElement("ul", { className: "todo__items" }, this.state.items.map((item, index) => /* @__PURE__ */ createElement(TodoItem, { key: item.id, text: item.text, onClick: (e) => this.handleRemove(index) }))), /* @__PURE__ */ createElement("input", { type: "text", onInput: (e) => this.handleInput(e), value: this.state.input }), /* @__PURE__ */ createElement("button", { onClick: (e) => this.handleAdd(this.state.input) }, "Add"));
    }
  };
  render(/* @__PURE__ */ createElement(Todo, null), document.getElementById("root"));
})();
