/** @jsx createElement */
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

let vdom = (
	<div id="foo">
		<ul>
			<li>1</li>
			<li>1</li>
			<li>1</li>
		</ul>
	</div>
);

let prettyVdom = JSON.stringify(vdom, null, 4);

let dom = render(vdom);

document.body.appendChild(dom);
