type WordPullUpProps = {
  words: string;
  className?: string;
};

export function WordPullUp({ words, className }: WordPullUpProps) {
  const items = words.split(' ');

  return (
    <span className={`inline-flex flex-wrap leading-[0.95] ${className ?? ''}`}>
      {items.map((word, index) => (
        <span key={`${word}-${index}`} className="overflow-hidden">
          <span
            className="inline-block translate-y-full animate-[pull-up_0.8s_ease-out_forwards]"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {word}
            {index !== items.length - 1 ? '\u00a0' : ''}
          </span>
        </span>
      ))}
    </span>
  );
}
