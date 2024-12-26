const App = {
  init: (text: string) => {
    const body = document.querySelector("body");
    const h1 = document.createElement("h1");
    h1.innerText = text;
    body?.prepend(h1);

    const footer = document.createElement("footer");
    footer.innerText = `Site last built: ${__TS__}`;
    body?.appendChild(footer);
  },
};

export default App;
