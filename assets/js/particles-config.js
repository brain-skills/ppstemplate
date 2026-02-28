const lightConfig = {
  particles: {
    number: { value: 100 },
    color: { value: "#ffffff" },
    shape: { type: "circle" },
    opacity: { value: 0.5 },
    size: { value: 3 },
    line_linked: {
      enable: true,
      distance: 250,
      color: "#ffffff",
      opacity: 0.4
    },
    move: { enable: true, speed: 4 }
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: "repulse" }
    }
  },
  retina_detect: true
};

const fullConfig = {
  particles: {
    number: { value: 100 },
    color: { value: "#ffffff" },
    shape: { type: "circle" },
    opacity: { value: 0.5 },
    size: { value: 3 },
    line_linked: {
      enable: true,
      distance: 250,
      color: "#ffffff",
      opacity: 0.4
    },
    move: { enable: true, speed: 4 }
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: "repulse" }
    }
  },
  retina_detect: true
};

const darkConfig = {
  particles: {
    number: { value: 100 },
    color: { value: "#666D6E" },
    shape: { type: "circle" },
    opacity: { value: 0.5 },
    size: { value: 3 },
    line_linked: {
      enable: true,
      distance: 250,
      color: "#666D6E",
      opacity: 0.4
    },
    move: { enable: true, speed: 4 }
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: "repulse" }
    }
  },
  retina_detect: true
};

document
  .querySelectorAll(
    '.particles-bottom-dark, .particles-bottom-light, .particles-top-light, .particles-full'
  )
  .forEach(container => {

    const uniqueId = 'particles-' + Math.random().toString(36).substr(2, 9);
    container.id = uniqueId;

    let config;

    if (container.classList.contains('particles-bottom-light')) {
      config = lightConfig;

    } else if (container.classList.contains('particles-top-light')) {
      config = lightConfig;

    } else if (container.classList.contains('particles-full')) {
      config = fullConfig;

    } else {
      config = darkConfig;
    }

    particlesJS(uniqueId, config);
  });
