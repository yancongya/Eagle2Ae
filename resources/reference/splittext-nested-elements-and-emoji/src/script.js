console.clear();

gsap.registerPlugin(SplitText);

document.fonts.ready.then(() => {
  // Elements
  const quote = document.querySelector("#quote");
  const buttons = {
    chars: document.querySelector("#chars"),
    words: document.querySelector("#words"),
    lines: document.querySelector("#lines"),
    combo: document.querySelector("#charsWordsLines"),
    revert: document.querySelector("#revert")
  };

  // Setup
  let splitText = SplitText.create(quote, {
    type: "words"
  });
  const tl = gsap.timeline();

  gsap.set(quote, { perspective: 400 });

  // Kill animations and revert text
  function kill() {
    tl.clear().time(0);
    splitText.revert();
  }

  // Split by characters
  buttons.chars.addEventListener("click", () => {
    kill();
    splitText.split({ type: "chars,words" });

    tl.from(splitText.chars, {
      duration: 1,
      scale: 4,
      autoAlpha: 0,
      rotationX: -180,
      transformOrigin: "100% 50%",
      ease: "back",
      stagger: 0.02
    });
  });

  // Split by words
  buttons.words.addEventListener("click", () => {
    kill();
    splitText.split({ type: "words" });

    splitText.words.forEach((el, i) => {
      tl.from(el, { duration: 1, opacity: 0, force3D: true }, i * 0.01);
      tl.from(el, { duration: 1, scale: i % 2 === 0 ? 0 : 2 }, i * 0.01);
    });
  });

  // Split by lines
  buttons.lines.addEventListener("click", () => {
    kill();
    splitText.split({
      type: "lines",
      autoSplit: true,
      onSplit: (self) => {
        return gsap.from(splitText.lines, {
          duration: 2,
          opacity: 0,
          x: -100,
          stagger: 0.1,
          ease: "expo.out"
        });
      }
    });
  });

  // Split by chars, words, and lines
  buttons.combo.addEventListener("click", () => {
    kill();
    splitText.split({ type: "chars,words,lines" });

    tl.from(
      splitText.chars,
      {
        duration: 0.6,
        autoAlpha: 0,
        scale: 3,
        force3D: true,
        stagger: 0.02
      },
      0.5
    )
      .to(
        splitText.words,
        {
          duration: 0.2,
          color: "#ff8709",
          scale: 0.9,
          stagger: 0.1
        },
        "words"
      )
      .to(
        splitText.words,
        {
          duration: 0.4,
          color: "white",
          scale: 1,
          stagger: 0.1
        },
        "words+=0.1"
      )
      .to(splitText.lines, {
        duration: 0.5,
        x: 100,
        autoAlpha: 0,
        stagger: 0.2
      });
  });

  // Revert
  buttons.revert.addEventListener("click", () => {
    splitText.revert();
  });
});
