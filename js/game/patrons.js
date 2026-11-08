// The ghosts at the start of each route: the people the streets are named after.
// Drawn from their portraits and statues, in pale "ghost" colours, and telling
// why they matter to Arad and why the street carries their name.
import { R } from './core.js';

const SKIN = '#e9f0fd';
const ghost = (name, body, extra, lines) => ({ type: 'npc', name, look: { kind: 'spirit', body, extra }, lines });

/* General Ion Dragalina (1860–1916): general's kepi, thick moustache, tunic with epaulettes and a medal */
const dragalina = ghost('Fantoma generalului Dragalina',
  { kind: 'human', skin: SKIN, hair: 'scurt', hairC: '#c3cbdd', shirt: { c: '#7d8fb6' }, pants: { c: '#7d8fb6' }, shoes: { c: '#5d6b8c' },
    acc: { cap: '#5c6d93', capBadge: '#f1d27a', mustache: '#9aa5bf' } },
  (x, hy, ty, f) => {
    R(x - 4, hy + 5, 1, 1, '#9aa5bf'); R(x + 3, hy + 5, 1, 1, '#9aa5bf');              // handlebar moustache ends
    R(x - 5, ty, 2, 1, '#f1d27a'); R(x + 3, ty, 2, 1, '#f1d27a');                      // epaulettes
    R(x, ty + 2, 1, 1, '#f1d27a'); R(x, ty + 4, 1, 1, '#f1d27a');                      // buttons
    R(f > 0 ? x - 3 : x + 1, ty + 2, 2, 2, '#f1d27a'); R(f > 0 ? x - 3 : x + 1, ty + 4, 2, 1, '#c95a5a'); // medal
  },
  ['Buuună ziua, soldat! Sunt generalul Ion Dragalina. Sau, mă rog, ce a mai rămas din mine.',
   'M-am născut în 1860 la Caransebeș, în Banat, aproape de voi. Am fost ofițer în armata austro-ungară, apoi am trecut în armata României.',
   'În Primul Război Mondial, în 1916, oamenii mei au eliberat Orșova. Apoi am condus Armata I pe Valea Jiului, unde am fost rănit. Am fost primul general român căzut în acel război.',
   'După Marea Unire din 1918, Aradul a devenit oraș românesc și i-a cinstit pe eroii războiului. Mie mi-a dat un bulevard chiar în inima lui.',
   'Pe Bulevardul General Dragalina e și Vechiul Cazinou. Mărșăluiește spre dreapta și fii atent la detalii!']);

/* Avram Iancu (1824–1872): long hair, moustache, wide-brimmed Moți hat, white shirt with a vest and belt */
const iancu = ghost('Fantoma lui Avram Iancu',
  { kind: 'human', skin: SKIN, hair: 'lung', hairC: '#7884a4', shirt: { c: '#f4f7ff' }, pants: { c: '#f4f7ff' }, shoes: { c: '#8590ad' },
    acc: { mustache: '#7884a4', vest: '#8a96b6' } },
  (x, hy, ty, f) => {
    R(x - 4, ty + 5, 8, 1, '#b7a98f');                                                  // belt
    R(x - 7, hy - 1, 14, 1, '#4f5a78'); R(x - 4, hy - 5, 8, 4, '#4f5a78');              // wide brim, crown
    R(x - 4, hy - 2, 8, 1, '#a3aec8');                                                  // hat band
  },
  ['Salutare, drumețule! Sunt Avram Iancu. Moții m-au numit „Craiul Munților”.',
   'În revoluția din 1848–1849, la doar 24 de ani, am condus moții din Munții Apuseni și am luptat pentru drepturile românilor din Transilvania.',
   'Și județul Arad mă ține minte: în Țara Zarandului, la Hălmagiu, am un monument, iar în oraș am o statuie în spatele Palatului de Justiție.',
   'Piața veche din centru îmi poartă numele pentru că am rămas un simbol al luptei românilor pentru libertate și dreptate.',
   '„Unicul dor al ființei mele este să-mi văd națiunea fericită.” Hai, explorează centrul vechi!']);

/* Aurel Vlaicu (1882–1913): leather aviator cap with goggles, white scarf, moustache, flying jacket */
const vlaicu = ghost('Fantoma lui Aurel Vlaicu',
  { kind: 'human', skin: SKIN, hair: 'scurt', hairC: '#8a95b2', shirt: { c: '#b9ab95' }, pants: { c: '#9aa3ba' }, shoes: { c: '#6f6a64' },
    acc: { mustache: '#8a95b2' } },
  (x, hy, ty, f) => {
    R(x - 5, hy - 2, 10, 4, '#a8957b'); R(x - 6, hy + 1, 2, 5, '#a8957b'); R(x + 4, hy + 1, 2, 5, '#a8957b'); // aviator cap, ear flaps
    R(x - 4, hy, 3, 2, '#cfe8ff'); R(x + 1, hy, 3, 2, '#cfe8ff'); R(x - 1, hy, 2, 1, '#6d5c48');            // goggles on the forehead
    R(x - 4, ty, 8, 2, '#ffffff'); R(f > 0 ? x - 7 : x + 4, ty + 1, 3, 2, '#ffffff'); R(f > 0 ? x - 9 : x + 7, ty + 2, 2, 1, '#ffffff'); // scarf in the wind
  },
  ['Bzzz... scuze, încă aud motorul. Sunt Aurel Vlaicu, inginer și unul dintre primii aviatori români.',
   'În 1910 am zburat cu primul meu avion, Vlaicu I, construit la București. Apoi a venit Vlaicu II, cu care am câștigat premii la Viena în 1912.',
   'Pe 14 iulie 1912 am zburat chiar deasupra Aradului, în fața a peste 25.000 de oameni. Am urcat peste 200 de metri și am trecut razant peste mulțime!',
   'Înainte de zbor, avionul meu a stat expus în sala de bal a Hotelului Central. Arădenii au venit să-l vadă de aproape.',
   'Aradul nu m-a uitat: universitatea, un cartier și calea pe care mergi acum îmi poartă numele. În 1913 am murit încercând să trec Carpații în zbor.',
   'Calea Aurel Vlaicu te duce spre AFI și spre stadion. Ține-te bine, decolăm!']);

export const PATRONS = { dragalina, iancu, vlaicu };
