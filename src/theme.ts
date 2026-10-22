import { staticFile } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadSyne } from "@remotion/google-fonts/Syne";

// Fontfabric Nexa Bold
if (typeof document !== "undefined") {
  const fontFace = new FontFace(
    "NexaBold",
    `url(${staticFile("fonts/Nexa-Bold.otf")}) format("opentype")`
  );
  fontFace
    .load()
    .then((loaded) => {
      document.fonts.add(loaded);
    })
    .catch((err) => {
      console.warn("Gagal load NexaBold font:", err);
    });
}

const anton = loadAnton();
const montserrat = loadMontserrat();
const outfit = loadOutfit();
const bebasNeue = loadBebasNeue();
const spaceGrotesk = loadSpaceGrotesk();
const syne = loadSyne();

export const theme = {
  fonts: {
    nexa: "NexaBold, Impact, Montserrat, sans-serif",
    anton: anton.fontFamily,
    montserrat: montserrat.fontFamily,
    outfit: outfit.fontFamily,
    bebasNeue: bebasNeue.fontFamily,
    spaceGrotesk: spaceGrotesk.fontFamily,
    syne: syne.fontFamily,
  },
  spring: {
    smooth: { damping: 18, stiffness: 120 },
    snappy: { damping: 14, stiffness: 220 },
    bouncy: { damping: 10, stiffness: 280, mass: 0.8 },
    pop: { damping: 12, stiffness: 320, mass: 0.6 },
  },
  colors: {
    white: "#FFFFFF",
    yellow: "#FFE600",
    lime: "#00FF66",
    cyan: "#00F0FF",
    magenta: "#FF007F",
    red: "#FF3344",
    gold: "#F5C518",
  },
};
