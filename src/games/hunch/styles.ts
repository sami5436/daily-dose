/** Hunch animations. Reduced motion turns every one of them off. */
export const HUNCH_CSS = `
@keyframes hunch-flip {
  0% { transform: rotateX(0); background: var(--card); }
  49% { transform: rotateX(90deg); background: var(--card); }
  50% { transform: rotateX(90deg); background: var(--tile-bg); }
  100% { transform: rotateX(0); background: var(--tile-bg); }
}
@keyframes hunch-bounce {
  0%, 100% { transform: translateY(0); }
  40% { transform: translateY(-14px); }
  70% { transform: translateY(2px); }
}
@keyframes hunch-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}
@keyframes hunch-pop {
  0% { transform: scale(0.9); }
  60% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
.hunch-flip { animation: hunch-flip 500ms ease-out backwards; }
.hunch-bounce { animation: hunch-bounce 600ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
.hunch-shake { animation: hunch-shake 360ms ease-out; }
.hunch-pop { animation: hunch-pop 140ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .hunch-flip, .hunch-bounce, .hunch-shake, .hunch-pop { animation: none !important; }
}
`;
