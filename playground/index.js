function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animate(win, to, duration) {
  return new Promise((resolve) => {
    const start = win.scrollY;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      win.scrollTo(0, start + (to - start) * easeInOut(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(step);
  });
}

async function scrollIt(win) {
  const doc = win.document;
  const max = Math.max(0, doc.documentElement.scrollHeight - win.innerHeight);

  await animate(win, 0, 400);
  await animate(win, max, 2000);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await animate(win, 0, 2000);
}

function bindScrollIt(button) {
  const iframe = button.closest(".demo-item")?.querySelector(".editor iframe");

  if (iframe) {
    iframe.addEventListener("load", () => {
      button.disabled = false;
    });

    button.addEventListener("click", () => {
      button.disabled = true;
      scrollIt(iframe.contentWindow).finally(() => {
        button.disabled = false;
      });
    });
  }
}

document.querySelectorAll(".scroll-it").forEach(bindScrollIt);

const more = document.querySelector(".getting-started .more");
if (more) {
  document.addEventListener("scroll", () => {
    more.classList.toggle("on", window.scrollY > 100);
  }, { passive: true });
}