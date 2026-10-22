import StickyGum from "../src/index.ts";

new StickyGum({
  sidebar: [".leftSidebar", ".content", ".rightSidebar"].map(function (selector) {
    return document.querySelector(selector);
  }),
  container: "#wrapperThreeColumns",
  offsetTop: 30,
  minWidth: 860
});
