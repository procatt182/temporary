import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DISCORD_INVITE_URL } from "@/lib/types";

const plans = [
  {
    name: "1 Month",
    price: "$9.99",
    period: "/month",
    description: "Perfect for trying out the client",
    features: [
      "Full client access",
      "HWID license (1 device)",
      "3 HWID changes",
      "Dashboard access",
      "Discord support",
    ],
    highlighted: false,
  },
  {
    name: "3 Months",
    price: "$24.99",
    period: "/3 months",
    description: "Best value for regular users",
    features: [
      "Full client access",
      "HWID license (1 device)",
      "3 HWID changes",
      "Dashboard access",
      "Priority Discord support",
      "Save 17%",
    ],
    highlighted: true,
  },
  {
    name: "Lifetime",
    price: "$49.99",
    period: "one-time",
    description: "Never pay again",
    features: [
      "Full client access",
      "HWID license (1 device)",
      "3 HWID changes",
      "Dashboard access",
      "Priority Discord support",
      "All future updates",
    ],
    highlighted: false,
  },
];

export function LandingPricing() {
  return (
    <section id="pricing" className="relative py-24 px-4 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground text-balance sm:text-4xl">
            Simple Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-pretty leading-relaxed">
            Choose the plan that works for you. All plans include full access to
            the client and dashboard.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl p-6 transition-all animate-fade-in-up ${
                plan.highlighted
                  ? "glass-glow ring-2 ring-primary/30 shadow-[0_0_30px_hsl(263_70%_58%/0.1)]"
                  : "glass-glow"
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Star className="h-3 w-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mb-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_24px_hsl(263_70%_58%/0.3)]"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                } transition-all`}
              >
                <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
                  Join Discord to Purchase
                </a>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          All purchases are handled through our Discord server for personalized support.
        </p>
      </div>
    </section>
  );
}
