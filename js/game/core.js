// Shared drawing state for the game. Everything draws through R() onto the
// current target canvas C (the screen, the portrait, or an offscreen buffer).
// C and T are live bindings: other modules read them, only setC/tick change them.

export const W = 320, H = 180, G = 132, FEET = 147;   // screen size, ground line, feet line
export let C = null;                                 // current 2D context
export let T = 0;                                    // frame counter (60 per second)
export const setC = c => { C = c; };
export const tick = () => { T++; };
export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function R(x,y,w,h,c){C.fillStyle=c;C.fillRect(Math.round(x),Math.round(y),w,h);}
export function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=(n>>16)+a,g=((n>>8)&255)+a,b=(n&255)+a;r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}
export function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
