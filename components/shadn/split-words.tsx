export function splitWords(text: string) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <span key={`${word}-${i}`} className="word-inner inline-block">
      {word}
      {i < words.length - 1 ? " " : ""}
    </span>
  ));
}
