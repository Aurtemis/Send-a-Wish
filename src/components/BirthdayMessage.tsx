interface BirthdayMessageProps {
  name: string;
  age: number;
  message: string;
}

export default function BirthdayMessage({ name, age, message }: BirthdayMessageProps) {
  return (
    <div className="space-y-4 text-[#3a2a20]">
      <p className="text-xs uppercase tracking-[0.2em] text-[#8c2f39]">Turning {age}</p>
      <h2 className="font-serif text-3xl leading-tight italic">Happy Birthday, {name}!</h2>
      <p className="whitespace-pre-wrap text-base leading-relaxed text-[#5b4a3a]">{message}</p>
    </div>
  );
}
