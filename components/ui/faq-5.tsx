import { Badge } from "@/components/ui/badge";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Faq5Props {
  badge?: string;
  heading?: string;
  description?: string;
  faqs?: FaqItem[];
  id?: string;
  className?: string;
  columns?: 1 | 2;
}

const defaultFaqs: FaqItem[] = [
  {
    question: "What is a FAQ and why is it important?",
    answer:
      "FAQ stands for Frequently Asked Questions. It is a list that provides answers to common questions people may have about a specific product, service, or topic.",
  },
  {
    question: "Why should I use a FAQ on my website or app?",
    answer:
      "Utilizing a FAQ section on your website or app is a practical way to offer instant assistance to your users or customers. Instead of waiting for customer support responses, they can find quick answers to commonly asked questions.",
  },
  {
    question: "How do I effectively create a FAQ section?",
    answer:
      "Creating a FAQ section starts with gathering the most frequent questions you receive from your users or customers. Once you have a list, you need to write clear, detailed, and helpful answers to each question.",
  },
  {
    question: "What are the benefits of having a well-maintained FAQ section?",
    answer:
      "There are numerous advantages to maintaining a robust FAQ section. Firstly, it provides immediate answers to common queries, which improves the user experience.",
  },
];

export const Faq5 = ({
  badge = "FAQ",
  heading = "Common Questions & Answers",
  description = "Find out all the essential details about our platform and how it can serve your needs.",
  faqs = defaultFaqs,
  id,
  className,
  columns = 2,
}: Faq5Props) => {
  const isTwoCol = columns === 2;

  return (
    <section id={id} className={className ?? "py-32 site-container"}>
      <div className="w-full">
        <div className="text-center">
          {badge ? (
            <Badge variant="secondary" className="text-xs font-medium">
              {badge}
            </Badge>
          ) : null}
          <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-heading">
            {heading}
          </h2>
          {description ? (
            <p className="mt-4 sm:mt-6 font-normal text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        <div
          className={
            isTwoCol
              ? "mx-auto mt-12 sm:mt-16 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-10"
              : "mx-auto mt-12 sm:mt-14 max-w-screen-sm flex flex-col gap-8"
          }
        >
          {faqs.map((faq, index) => (
            <div key={index} className="flex gap-4 text-start items-start">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-secondary font-mono text-xs text-primary mt-0.5">
                {index + 1}
              </span>
              <div>
                <h3 className="mb-2 font-medium text-foreground leading-snug">
                  {faq.question}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
