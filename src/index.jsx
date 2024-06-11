import { patch, render, createElement } from "./renderer";

// const list = [1, 2, 3, 4];

// let oldDom = (
//   <div id="foo">
//     <button
//       onClick={() => {
//         console.log(12312312321);
//       }}>
//       Click Me
//     </button>
//     <ul>
//       {list.map((l) => (
//         <li>{l}</li>
//       ))}
//       <li className="hello-1">1</li>
//       <ul>
//         <li className="hello-2">inner 1</li>
//         <li className="hello-3">inner 2</li>
//       </ul>
//       <li className="hello-2">2</li>
//       <li className="hello-3">3</li>
//     </ul>
//   </div>
// );

// let newDom = (
//   <div id="foo">
//     <ul>
//       <ul>
//         <li className="hello-2" key="first">
//           inner 1
//         </li>
//         <li className="hello-3" key="second">
//           inner 2
//         </li>
//       </ul>
//       <li className="hello-1">1</li>
//       <li className="hello-2">2</li>
//       <li className="hello-3">3</li>
//     </ul>
//   </div>
// );

// console.log("oldDom :>> ", oldDom);
// console.log("newDom :>> ", newDom);
// const dom = render(oldDom, document.getElementById("root"));
// console.log("dom :>> ", dom);
// patch(dom, newDom);

const oldList = (
  <ul className="some-list">
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
