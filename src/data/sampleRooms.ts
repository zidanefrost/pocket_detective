import { SampleRoom } from "../types";

export const SAMPLE_ROOMS: SampleRoom[] = [
  {
    id: "cyber-living-room",
    title: "Dim Cyber Living Room",
    description: "Living room with coffee table, desk lamp, books, and couch.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCwakvi0K3-Y8LCAmH6Vd4rBudjGU-zcwnGLqd522UsNdudlPBQ_BQd6M7GRDeT3u5lWlcX7xQUYryce5RTKNs3FbUbPExc_sp9a3PkNELaDwr64GmQkOj8iQQW_a3bzhwP-Aq1X9QlIB9uCh7DJqcxFYbCMH9FcPWl5Jm7ZffYAN1v3NDdIuApoZ577lr4_z4sqw47KeRSTEjZ_hs8eUInY1UYnrGmsb-C1r6COC4U4ctrVBTAGnUG62RH2n-EI5S8iFtSM6pXi0",
    sampleOpening: "The heavy steel door locks shut with a sharp metallic clack. Neon cyan conduits pulse along the perimeter walls. To escape this sealed sector, you must decode 3 ancient physical anchors hidden within this room.",
    sampleClues: [
      {
        target_object_name: "The Leather Bound Book",
        poetic_clue: "I hold a thousand stories yet cannot speak a word,\nLook close beside the glowing lamp where wisdom is stored.",
        storyline_continuation: "Inside the book's spine, you discover a glowing microchip circuit that decrypts the first lock layer."
      },
      {
        target_object_name: "Coffee Mug",
        poetic_clue: "I hold dark warm liquid to start your busy day,\nSearch where caffeine rests before it fades away.",
        storyline_continuation: "Underneath the ceramic base, a hidden optic sensor responds to your touch with a soft green pulse."
      },
      {
        target_object_name: "Desk Lamp",
        poetic_clue: "I cast a warm light through the shadowy room,\nLook near my switch to dispel the creeping gloom.",
        storyline_continuation: "Toggling the lamp reveals the final master override code projected onto the wall! The sector door unlocks!"
      }
    ]
  },
  {
    id: "arcane-study",
    title: "Detective's Study & Bookshelf",
    description: "Study desk with vintage books, wall clock, and desk lamp.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcBXhGthNspT1XseCeFVzVKQnXN8AWBD3F_gsswsTwW6iHZDhX5iMg_wQNu48awkU-8g1D5ib4_yiknnfR2T70gK67j9jfbwoB4JoL3wR2zlZzWOYsEqWHCfBEfLoqt1EK1pA6dxVl5RDoixjrIk5Q9ngWnMbc3S3eftoq9JKtMmyiUPPoUWcsvwaZiDoKffhBA-6QkcyZhrt43z_gSOlaVd4YZjVTs7nYKgzfx9rIQR9rCdNwTKCR6qE1E2WsB5nmx4oKzTcY-9M",
    sampleOpening: "You find yourself trapped inside the archivist's sanctuary. The room hums with temporal energy. Find the 3 hidden artifacts to realign the room matrix and escape.",
    sampleClues: [
      {
        target_object_name: "Ancient Tome",
        poetic_clue: "Bound in dark leather with runes upon the spine,\nFind me on the wooden desk where mysteries align.",
        storyline_continuation: "The tome springs open automatically, releasing a bright cyan glyph."
      },
      {
        target_object_name: "Brass Fountain Pen",
        poetic_clue: "My tip leaves dark ink across the blank white page,\nI rest beside the book of a forgotten mage.",
        storyline_continuation: "The pen acts as a mechanical key, slotting perfectly into the desk drawer lock."
      },
      {
        target_object_name: "Wall Clock",
        poetic_clue: "My hands turn steadily though I have no arms,\nFind me ticking high above to silence the alarms.",
        storyline_continuation: "Stopping the clock hands at 12:00 unlocks the main portal. Freedom is yours!"
      }
    ]
  }
];
