export default {
  entryPoints: ["./src/index.jsx"],
  bundle: true,
  platform: "node",
  outfile: "build/index.js",
  sourcemap: true,
  target: "node12",
  external: Object.keys(require("./package.json").dependencies),
  jsxFactory: "createElement",
};
