import { patch, createElement, setAttribute, render } from "./renderer";

const oldList = (
  <ul className="some-list">
    {/* <button
      className="dummy-class"
      onClick={() => console.log("clicked")}
      ref={(e) => {
        console.log("ref to button :>> ", e);
      }}>
      Click me
    </button>
    <ul>
      <li>One</li>
      <li>One</li>
      <li>One</li>
    </ul> */}
    <li className="some-list__item" key="one">
      One
    </li>
    <li className="some-list__item" key="two">
      Two
    </li>
  </ul>
);
const newList = (
  <ul className="some-list">
    <li className="some-list__item" key="one">
      Four
    </li>
    <li className="some-list__item" key="three">
      Three
    </li>
    <li className="some-list__item" key="two">
      Two
    </li>
  </ul>
);

const dom = render(oldList, document.getElementById("root"));
console.log("dom :>> ", dom);
patch(dom, newList);
