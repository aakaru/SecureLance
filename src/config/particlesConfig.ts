import type { ISourceOptions } from "@tsparticles/engine";
export const particlesOptions: any = {
  fpsLimit: 60,
  interactivity: {
    events: {
      onClick: {
        enable: false,
        mode: 'push',
      },
      onHover: {
        enable: true,
        mode: 'grab',
        parallax: { enable: true, force: 60, smooth: 10 }
      },
      resize: { enable: true },
    },
    modes: {
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
      grab: {
        distance: 150,
        links: {
          opacity: 0.3,
        }
      }
    },
  },
  particles: {
    color: {
      value: ["#9B87F5", "#A855F7", "#60A5FA"], 
    },
    links: {
      color: "#ffffff", 
      distance: 140, 
      enable: true,
      opacity: 0.06, 
      width: 1,
    },
    collisions: {
      enable: false,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "bounce",
      },
      random: true,
      speed: 1.5, 
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80, 
    },
    opacity: {
      value: {
        min: 0.1,
        max: 0.6
      },
      animation: {
        enable: true,
        speed: 0.5,
        minimumValue: 0.1,
        sync: false
      }
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 4 },
      animation: {
        enable: true,
        speed: 2,
        minimumValue: 0.5,
        sync: false
      }
    },
  },
  detectRetina: true,
};
