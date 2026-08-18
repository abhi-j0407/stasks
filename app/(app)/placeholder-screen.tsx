import { LipButton } from "@/components/buttons/lip-button";

type PlaceholderScreenProps = {
  title: string;
  line: string;
  cta: string;
};

export function PlaceholderScreen({ title, line, cta }: PlaceholderScreenProps) {
  return (
    <main>
      <h1 className="text-headline">{title}</h1>
      <p className="placeholder-screen__line">{line}</p>
      <div className="placeholder-screen__cta">
        <LipButton variant="primary" className="lip-button--block">
          {cta}
        </LipButton>
      </div>
    </main>
  );
}
