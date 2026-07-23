// Wraps each word of a heading in its own inline-block span (marked with
// the "word-inner" class) so GSAP can stagger them in individually instead
// of animating the whole heading as one solid block.
export function splitWords(text: string) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <span key={`${word}-${i}`} className="word-inner inline-block">
      {word}
      {i < words.length - 1 ? " " : ""}
    </span>
  ));
}
