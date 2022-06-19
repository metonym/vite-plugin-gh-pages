const App = {
  init: (text: string) => {
    const body = document.querySelector("body");
    const h1 = document.createElement("h1");

    h1.innerText = text;
    body?.prepend(h1);
  },
};

export default App;
